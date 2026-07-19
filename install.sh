#!/usr/bin/env bash
set -e

VAULT="${1}"
if [ -z "$VAULT" ]; then
    echo "ERROR: falta ruta al vault"
    echo "Uso: bash install.sh RUTA_VAULT"
    exit 1
fi

VAULT="$(cd "$(dirname "$VAULT")" && pwd)/$(basename "$VAULT")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Vault: $VAULT"
echo "Scripts: $SCRIPT_DIR"

mkdir -p "$VAULT/Meta"
mkdir -p "$VAULT/03_nodes/thoughts"
mkdir -p "$VAULT/03_nodes/doubts"
mkdir -p "$VAULT/03_nodes/ideas"
mkdir -p "$VAULT/03_nodes/conversations"
mkdir -p "$VAULT/staging"
mkdir -p "$VAULT/staging/procesadas"

cat > "$SCRIPT_DIR/config.json" << EOF
{
  "vault_path": "VAULT_PATH_PLACEHOLDER",
  "board_file": "Meta/agent-messages.md",
  "nodes_folder": "03_nodes",
  "staging_folder": "staging",
  "processed_folder": "procesadas"
}
EOF

ESCAPED_VAULT="${VAULT//\\/\\\\}"
sed -i '' "s|VAULT_PATH_PLACEHOLDER|$ESCAPED_VAULT|g" "$SCRIPT_DIR/config.json" 2>/dev/null || sed -i "s|VAULT_PATH_PLACEHOLDER|$ESCAPED_VAULT|g" "$SCRIPT_DIR/config.json"

BOARD="$VAULT/Meta/agent-messages.md"
if [ ! -f "$BOARD" ]; then
    echo "# Tablero de Mensajes entre Agentes — nOOxcuro" > "$BOARD"
    echo "Tablero creado"
fi

echo ""
echo "Verificando imports..."
cd "$SCRIPT_DIR"
python3 -c "from agents import AGENTS, CATEGORY_TO_FOLDER; print('OK agents:', list(AGENTS.keys()))"
python3 -c "from agent_parser import extract_facts; print('OK parser')"
python3 -c "from agent_classifier import classify; print('OK classifier')"
python3 -c "from agent_board import read_board; print('OK board')"

echo ""
echo "INSTALACION COMPLETA"
echo "Para importar de Apple Notes y procesar: bash sync.sh"
echo "Para solo procesar staging existente: bash run.sh"