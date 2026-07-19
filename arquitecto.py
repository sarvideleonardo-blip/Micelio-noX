#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arquitecto v2.1: Importer de Apple Notes para noXcuro.

Saca notas de Apple Notes (SQLite) y las guarda como .txt en staging/.
El pipeline (step_parser + step_classifier + step_enrich + step_writer)
procesa esos .txt y genera las notas .md en 03_nodes/.

Uso:
    python3 arquitecto.py --minutos 60
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

try:
    import html2text
    HAS_HTML2TEXT = True
except ImportError:
    HAS_HTML2TEXT = False


def _create_temp_file(content: str) -> str:
    staging_dir = os.path.join(SCRIPT_DIR, "staging")
    os.makedirs(staging_dir, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe = "".join(c for c in content[:40] if c.isalnum() or c in " -_").strip().replace(" ", "-")
    filename = f"apple_note_{ts}_{safe}.txt"
    filepath = os.path.join(staging_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    return filepath


def run_importer(minutes: int):
    print(f"--- INICIANDO IMPORTADOR DE APPLE NOTES ---")
    print(f"Buscando notas modificadas en los ultimos {minutes} minutos...\n")

    if not HAS_HTML2TEXT:
        print("ERROR: html2text no esta instalado.")
        print("Instalalo con: pip3 install html2text")
        return

    db_path = os.path.expanduser("~/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite")
    if not os.path.exists(db_path):
        print(f"ERROR: No se encontro la base de datos de Apple Notes en:")
        print(f"   {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        time_threshold = (datetime.utcnow() - timedelta(minutes=minutes) - datetime(2001, 1, 1)).total_seconds()

        query = """
        SELECT n.ZTITLE, b.ZHTMLSTRING
        FROM ZICNOTEDATA AS n
        JOIN ZICNOTEBODY AS b ON n.ZBODY = b.Z_PK
        WHERE n.ZMODIFICATIONDATE1 >= ? AND n.ZTRASHED = 0
        ORDER BY n.ZMODIFICATIONDATE1 DESC
        """

        cursor.execute(query, (time_threshold,))
        notes = cursor.fetchall()
        conn.close()

        if not notes:
            print("No se encontraron notas nuevas.")
            return

        print(f"Se encontraron {len(notes)} notas.\n")
        h = html2text.HTML2Text()
        h.body_width = 0

        for i, (title, html_body) in enumerate(notes):
            print(f"  [{i+1}/{len(notes)}] {title or 'Sin titulo'}")
            markdown_body = h.handle(html_body or "")
            full_content = f"# {title}\n\n{markdown_body}" if title else markdown_body
            temp_file = _create_temp_file(full_content)

        print(f"\n--- IMPORTACION COMPLETADA ---")
        print(f"{len(notes)} notas guardadas en staging/")
        print(f"Corre ahora: bash run.sh")

    except Exception as e:
        print(f"ERROR durante la importacion: {e}")


def main():
    parser = argparse.ArgumentParser(description="Importer de Apple Notes para noXcuro")
    parser.add_argument("--minutos", type=int, default=60, help="Minutos hacia atras para buscar notas")
    args = parser.parse_args()
    run_importer(args.minutos)


if __name__ == "__main__":
    main()