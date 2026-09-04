from typing import List, Dict, Optional
from app.models import Account, AccountHealthResponse
from app.seed_data import get_seed_accounts
from app.gtm_engine import evaluate_account_health


class AccountDatabase:
    def __init__(self):
        self._accounts: Dict[str, Account] = {}
        self.reset()

    def reset(self):
        seed = get_seed_accounts()
        self._accounts = {acct.id: acct for acct in seed}

    def get_all(self) -> List[Account]:
        return list(self._accounts.values())

    def get_by_id(self, account_id: str) -> Optional[Account]:
        return self._accounts.get(account_id)

    def update_account_simulation(
        self,
        account_id: str,
        simulated_wau_pct: Optional[float] = None,
        simulated_time_reduction_pct: Optional[float] = None,
        simulated_retention_pct: Optional[float] = None,
        isolate_wau_effect: bool = False,
    ) -> Optional[Account]:
        acct = self._accounts.get(account_id)
        if not acct:
            return None

        # Create updated copy
        updated_data = acct.model_dump()

        if simulated_wau_pct is not None:
            updated_data["weekly_active_users"] = int(round(simulated_wau_pct * acct.activated_users))
            # update the last 4 weeks of WAU history to reflect the trend
            hist = list(acct.weekly_wau_history)
            hist[-1] = round(simulated_wau_pct, 3)
            # if dragged down significantly, create downward trend
            if simulated_wau_pct < 0.60:
                hist[-2] = round(min(hist[-2], simulated_wau_pct + 0.06), 3)
                hist[-3] = round(min(hist[-3], simulated_wau_pct + 0.12), 3)
                # Only couple retention & outcome if not in isolated mode (Scenario Assumption mode)
                if not isolate_wau_effect:
                    if simulated_retention_pct is None:
                        updated_data["retained_30d_users"] = int(round(max(0.15, simulated_wau_pct * 1.05) * acct.activated_users))
                    if simulated_time_reduction_pct is None:
                        updated_data["workflow_time_reduction_pct"] = round(min(acct.workflow_time_reduction_pct, max(0.04, simulated_wau_pct * 0.35)), 3)
            updated_data["weekly_wau_history"] = hist

        if simulated_time_reduction_pct is not None:
            updated_data["workflow_time_reduction_pct"] = max(0.01, min(0.50, simulated_time_reduction_pct))

        if simulated_retention_pct is not None:
            updated_data["retained_30d_users"] = int(round(simulated_retention_pct * acct.activated_users))

        updated_account = Account(**updated_data)
        self._accounts[account_id] = updated_account
        return updated_account


db = AccountDatabase()
