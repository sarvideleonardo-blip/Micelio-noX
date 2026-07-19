#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  nOOxcuro sync — $(date)"
echo "============================================"

# Check dependencies
echo ""
echo "Verificando dependencias..."
python3 -c "from agents import AGENTS, CATEGORY_TO_FOLDER; print('  OK agents')" || { echo "ERROR: agents.py fallo"; exit 1; }
python3 -c "from agent_parser import extract_facts; print('  OK parser')" || { echo "ERROR: agent_parser.py fallo"; exit 1; }
python3 -c "from agent_classifier import classify; print('  OK classifier')" || { echo "ERROR: agent_classifier.py fallo"; exit 1; }
python3 -c "from agent_board import read_board; print('  OK board')" || { echo "ERROR: agent_board.py fallo"; exit 1; }

# Step 0: Import from Apple Notes
echo ""
echo "--- PASO 0: IMPORTAR APPLE NOTES ---"
python3 arquitecto.py --minutos 60

# Step 1: Parser
echo ""
echo "--- PASO 1: PARSER ---"
python3 step_parser.py --staging staging

# Step 2: Classifier
echo ""
echo "--- PASO 2: CLASSIFIER ---"
python3 step_classifier.py

# Step 3: Enrich
echo ""
echo "--- PASO 3: ENRICH ---"
python3 step_enrich.py

# Step 4: Writer
echo ""
echo "--- PASO 4: WRITER ---"
python3 step_writer.py

echo ""
echo "============================================"
echo "  Sync completado — $(date)"
echo "============================================"