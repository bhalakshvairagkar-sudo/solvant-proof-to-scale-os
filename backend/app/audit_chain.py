import hashlib
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditEvent(BaseModel):
    event_id: str
    sequence_number: int
    timestamp: str
    event_type: str  # "trust_response", "expansion_verdict", "pricing_simulation", "pilot_milestone"
    account_id: str
    summary: str
    input_hash: str
    output_hash: str
    previous_hash: str
    event_hash: str


class AuditChainVerificationResponse(BaseModel):
    valid: bool
    events_checked: int
    chain_head: str
    broken_at_event: Optional[int] = None
    reason: Optional[str] = None


def hash_payload(data: Any) -> str:
    """Computes deterministic SHA-256 hash of JSON serializable payload."""
    try:
        raw = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
    except Exception:
        raw = str(data).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def compute_event_hash(
    seq: int,
    ts: str,
    event_type: str,
    account_id: str,
    input_hash: str,
    output_hash: str,
    previous_hash: str,
    summary: str,
) -> str:
    """Computes SHA-256 hash of the chained event block."""
    block = f"{seq}|{ts}|{event_type}|{account_id}|{input_hash}|{output_hash}|{previous_hash}|{summary}"
    return hashlib.sha256(block.encode("utf-8")).hexdigest()


class AuditTrailLedger:
    def __init__(self):
        self._events: List[AuditEvent] = []
        self._initialize_seed_chain()

    def _initialize_seed_chain(self):
        """Initializes the ledger with verifiable historical pilot events."""
        self._events = []
        genesis_prev = "0" * 64
        
        seed_events = [
            (
                "pilot_milestone",
                "acct_acme_corp",
                {"step": "pilot_deposit_escrowed", "amount": 12000, "currency": "USD"},
                {"escrow_status": "LOCKED", "refundable_against_metrics": True},
                "Acme Corp $12,000 pilot deposit escrowed against 6 objective value thresholds",
                "2026-07-01T09:00:00Z",
            ),
            (
                "pilot_milestone",
                "acct_acme_corp",
                {"step": "day_30_midpoint_review", "activated_users": 48, "target": 35},
                {"activation_rate": 0.96, "status": "EXCEEDED"},
                "Acme Corp Day 30 review: 96% activation achieved; FP&A variance pipeline active",
                "2026-07-31T14:30:00Z",
            ),
            (
                "expansion_verdict",
                "acct_acme_corp",
                {"consecutive_wau_weeks": 4, "avg_wau": 0.825, "time_reduction": 0.28, "retention": 0.875},
                {"verdict": "EXPAND", "criteria_all_met": True},
                "Acme Corp Day 56: All 4 expansion criteria verified by customer logs; verdict EXPAND",
                "2026-08-25T11:15:00Z",
            ),
            (
                "trust_response",
                "acct_acme_corp",
                {"query": "Where is general ledger data stored?"},
                {"claim_ids": ["residency_001", "training_001"], "guard_status": "PASSED"},
                "Trust inquiry validated: regional VPC boundary & zero data retention confirmed",
                "2026-08-26T16:00:00Z",
            ),
        ]

        prev_hash = genesis_prev
        for i, (etype, acct_id, inp, outp, summary, ts) in enumerate(seed_events):
            ih = hash_payload(inp)
            oh = hash_payload(outp)
            eh = compute_event_hash(i + 1, ts, etype, acct_id, ih, oh, prev_hash, summary)
            event = AuditEvent(
                event_id=f"audit_evt_{i+1:04d}",
                sequence_number=i + 1,
                timestamp=ts,
                event_type=etype,
                account_id=acct_id,
                summary=summary,
                input_hash=ih,
                output_hash=oh,
                previous_hash=prev_hash,
                event_hash=eh,
            )
            self._events.append(event)
            prev_hash = eh

    def get_events(self, limit: int = 50) -> List[AuditEvent]:
        return self._events[-limit:]

    def record_event(
        self,
        event_type: str,
        account_id: str,
        input_payload: Any,
        output_payload: Any,
        summary: str,
    ) -> AuditEvent:
        seq = len(self._events) + 1
        ts = datetime.now(timezone.utc).isoformat()
        prev_hash = self._events[-1].event_hash if self._events else "0" * 64
        ih = hash_payload(input_payload)
        oh = hash_payload(output_payload)
        eh = compute_event_hash(seq, ts, event_type, account_id, ih, oh, prev_hash, summary)

        event = AuditEvent(
            event_id=f"audit_evt_{seq:04d}",
            sequence_number=seq,
            timestamp=ts,
            event_type=event_type,
            account_id=account_id,
            summary=summary,
            input_hash=ih,
            output_hash=oh,
            previous_hash=prev_hash,
            event_hash=eh,
        )
        self._events.append(event)
        return event

    def verify_audit_chain(self) -> AuditChainVerificationResponse:
        """
        Validates entire chain from genesis to head:
        1. Checks previous_hash matches preceding event's event_hash
        2. Recalculates event_hash to ensure zero tampering
        """
        if not self._events:
            return AuditChainVerificationResponse(valid=True, events_checked=0, chain_head="0" * 64)

        prev_hash = "0" * 64
        for idx, event in enumerate(self._events):
            # Check link to previous event
            if event.previous_hash != prev_hash:
                return AuditChainVerificationResponse(
                    valid=False,
                    events_checked=idx,
                    chain_head=self._events[-1].event_hash,
                    broken_at_event=event.sequence_number,
                    reason=f"Previous hash mismatch at sequence #{event.sequence_number}: expected {prev_hash[:12]}..., found {event.previous_hash[:12]}...",
                )

            # Recalculate hash
            recomputed = compute_event_hash(
                event.sequence_number,
                event.timestamp,
                event.event_type,
                event.account_id,
                event.input_hash,
                event.output_hash,
                event.previous_hash,
                event.summary,
            )
            if recomputed != event.event_hash:
                return AuditChainVerificationResponse(
                    valid=False,
                    events_checked=idx,
                    chain_head=self._events[-1].event_hash,
                    broken_at_event=event.sequence_number,
                    reason=f"Tampering detected at event #{event.sequence_number}: computed hash {recomputed[:12]}... does not match recorded hash {event.event_hash[:12]}...",
                )

            prev_hash = event.event_hash

        return AuditChainVerificationResponse(
            valid=True,
            events_checked=len(self._events),
            chain_head=self._events[-1].event_hash,
            broken_at_event=None,
            reason=None,
        )

    def simulate_tamper_for_demo(self, sequence_number: int = 2) -> Dict[str, Any]:
        """Modifies an event summary in memory to demonstrate live chain failure to judges."""
        for event in self._events:
            if event.sequence_number == sequence_number:
                # Corrupt summary text without updating hash
                event.summary = f"[TAMPERED] Modified output without updating cryptographic hash"
                return {
                    "status": "tampered",
                    "tampered_sequence": sequence_number,
                    "event_id": event.event_id,
                }
        return {"status": "event_not_found"}

    def reset_chain(self):
        self._initialize_seed_chain()


# Global singleton instance
audit_ledger = AuditTrailLedger()

