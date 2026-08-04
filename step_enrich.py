#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paso 3 (independiente): enrich.

Lee del tablero los mensajes 'pendiente' dirigidos a 'enrich', llama al
agente especializado según la categoría (Metodo, Cosmogonia, etc.), marca
el mensaje como completado, y publica uno nuevo 'pendiente' para 'writer'.

Uso:
    python3 step_enrich.py
"""

from __future__ import annotations

import os
import sys

SCRIPT_FOLDER = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_FOLDER)
sys.path.insert(0, SCRIPT_FOLDER)
sys.path.insert(0, PROJECT_ROOT)

from agents import AGENTS
from agent_board import get_pending, mark_status, post_message
from shared_config import load_config, get_board_path


def main():
    config = load_config()
    board_path = get_board_path(config)
    pendientes = get_pending(board_path, "enrich")

    if not pendientes:
        print("No hay mensajes pendientes para enrich.")
        return

    for msg in pendientes:
        category = msg["payload"].get("category", "Metodo")
        parsed_text = msg["payload"].get("parsed_text", "")
        raw_text = msg["payload"].get("raw_text", parsed_text)
        agent_fn = AGENTS.get(category, AGENTS.get("Metodo"))
        enrichment = agent_fn(parsed_text)

        # Marcar si es teoría/tratado extenso para derivar la ruta de salida
        if (category or "").strip().lower() in {"cosmogonia", "identidad", "leyes"}:
            enrichment["es_teoria"] = True
        else:
            enrichment["es_teoria"] = False

        mark_status(board_path, msg["id"], "completado")
        next_id = post_message(
            board_path,
            step="writer",
            note_ref=msg.get("note_ref", ""),
            payload={
                "raw_text": raw_text,
                "category": category,
                "tags": msg["payload"].get("tags", []),
                "mentions": msg["payload"].get("mentions", []),
                "enrichment": enrichment,
            },
        )
        print(f"✨ {msg.get('note_ref')} enriquecida ({category}) -> MSG-{next_id} (pendiente para writer)")


if __name__ == "__main__":
    main()
