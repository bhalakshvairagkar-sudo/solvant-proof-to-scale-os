#!/usr/bin/env bash
set -e
echo "=== Building Solvant Frontend ==="
cd frontend
npm install
npm run build
cd ..
echo "=== Installing Backend Dependencies ==="
cd backend
pip install -r requirements.txt
cd ..
echo "=== Build Complete ==="
