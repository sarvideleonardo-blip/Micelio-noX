#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paso 2 (independiente): classifier.

Lee del tablero los mensajes 'pendiente' dirigidos a 'classifier', clasifica
el texto, marca ese mensaje como completado, y publica uno nuevo 'pendiente'
para el paso 'enrich'. No sabe nada del parser ni del writer.

Uso:
    python3 step_classifier.py
"""

from __future__ import annotations

import os
import sys

SCRIPT_FOLDER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_FOLDER)

from agent_classifier import classify
from agent_board import get_pending, mark_status, post_message
from shared_config import load_config, get_board_path


def main():
    config = load_config()
    board_path = get_board_path(config)
    pendientes = get_pending(board_path, "classifier")

    if not pendientes:
        print("No hay mensajes pendientes para classifier.")
        return

    for msg in pendientes:
        parsed_text = msg["payload"].get("parsed_text", "")
        raw_text = msg["payload"].get("raw_text", parsed_text) # Usar parsed si raw no está
        mentions = msg["payload"].get("mentions", [])
        classification = classify(parsed_text)
        mark_status(board_path, msg["id"], "completado")
        next_id = post_message(
            board_path,
            step="enrich",
            note_ref=msg.get("note_ref", ""),
            payload={
                "raw_text": raw_text,
                "parsed_text": parsed_text,
                "mentions": mentions,
                "category": classification["category"],
                "tags": classification["tags"],
            },
        )
        print(f"🏷️  {msg.get('note_ref')} -> categoría: {classification['category']} -> MSG-{next_id} (pendiente para enrich)")


if __name__ == "__main__":
    main()
