#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_logs.py: Sincroniza logs de IAs de logs/sessions/ a 02_logs_ia/<ia>/ en el vault.
Detecta logs nuevos por nombre de archivo, evita duplicados usando manifiesto.
"""

import os
import sys
import shutil
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent
VAULT_PATH = Path("/Users/mac/Desktop/nOOxcuro")

# Configuración
LOGS_SESSIONS_DIR = PROJECT_ROOT / "logs" / "sessions"
VAULT_LOGS_DIR = VAULT_PATH / "02_logs_ia"
MANIFEST_FILE = PROJECT_ROOT / "logs" / "sync_manifest.json"


def load_manifest() -> list:
    if MANIFEST_FILE.exists():
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_manifest(manifest: list):
    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def detect_new_logs(manifest: list) -> list:
    new_logs = []
    if not LOGS_SESSIONS_DIR.exists():
        return new_logs
    for log_file in sorted(LOGS_SESSIONS_DIR.glob("*_*.md")):
        filename = log_file.name
        if filename not in manifest:
            new_logs.append(log_file)
    return new_logs


def copy_log_to_vault(log_file: Path) -> Path:
    # Nombre esperado: <ia>_YYYY-MM-DD.md
    stem = log_file.stem
    ia = stem.split("_")[0] if "_" in stem else "unknown"
    target_dir = VAULT_LOGS_DIR / ia
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / log_file.name
    shutil.copy2(log_file, target_path)
    return target_path


def sync():
    print("--- 🔁 Iniciando sync_logs ---")
    manifest = load_manifest()
    new_logs = detect_new_logs(manifest)
    if not new_logs:
        print("✅ No hay logs nuevos para sincronizar.")
        return
    for log_file in new_logs:
        target_path = copy_log_to_vault(log_file)
        manifest.append(log_file.name)
        print(f"📝 Sincronizado: {log_file.name} -> {target_path}")
    save_manifest(manifest)
    print("--- ✅ Sync completado ---")


if __name__ == "__main__":
    sync()