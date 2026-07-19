#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paso 1 (independiente): parser.

Toma un archivo de texto (o todos los .txt de una carpeta de staging),
extrae hechos, y publica un mensaje 'pendiente' para el paso 'classifier'
en el tablero (Meta/agent-messages.md). No llama a nada más directamente.

Uso:
    python3 step_parser.py captura.txt
    python3 step_parser.py --staging apple_notes_staging/
"""

from __future__ import annotations

import argparse
import os
import sys

SCRIPT_FOLDER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_FOLDER)

from agent_parser import extract_facts
from agent_board import post_message
from shared_config import load_config, get_board_path


def procesar_archivo(filepath: str, board_path: str) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        raw_text = f.read().strip()
    if not raw_text:
        print(f"⚠️  Vacío, se salta: {filepath}")
        return ""
    facts = extract_facts(raw_text)
    note_ref = os.path.basename(filepath)
    msg_id = post_message(
        board_path,
        step="classifier",
        note_ref=note_ref,
        payload={
            "raw_text": raw_text,
            "parsed_text": facts["parsed_text"],
            "mentions": facts["mentions"],
        },
    )
    print(f"📥 {note_ref} -> MSG-{msg_id} (pendiente para classifier)")
    return msg_id


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("archivo", nargs="?", help="Archivo .txt individual a procesar")
    ap.add_argument("--staging", help="Carpeta con varios .txt a procesar en lote")
    ap.add_argument("--mover-a", default="procesadas", help="Subcarpeta donde mover los .txt ya publicados")
    args = ap.parse_args()

    config = load_config()
    board_path = get_board_path(config)

    if args.staging:
        staging = os.path.abspath(args.staging)
        done_folder = os.path.join(staging, args.mover_a)
        os.makedirs(done_folder, exist_ok=True)
        archivos = [f for f in os.listdir(staging) if f.endswith(".txt")]
        if not archivos:
            print("No hay .txt pendientes en la carpeta de staging.")
            return
        for nombre in archivos:
            filepath = os.path.join(staging, nombre)
            msg_id = procesar_archivo(filepath, board_path)
            if msg_id:
                os.rename(filepath, os.path.join(done_folder, nombre))
    elif args.archivo:
        procesar_archivo(args.archivo, board_path)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
