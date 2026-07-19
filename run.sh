#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== nOOxcuro pipeline ==="
python3 step_parser.py --staging staging
python3 step_classifier.py
python3 step_enrich.py
python3 step_writer.py
echo "=== Completado ==="