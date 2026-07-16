#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash setup.sh
#   source .venv/bin/activate

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Creating virtual environment..."
python3 -m venv .venv

echo "Activating virtual environment for this script..."
source .venv/bin/activate

echo "Upgrading pip..."
python -m pip install --upgrade pip

echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

source .venv/bin/activate

echo
echo "Setup complete."
echo "To use it in your shell, run:"
echo "  source .venv/bin/activate"
