#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paso 4 (independiente): writer.

Escribe la nota final .md en 03_nodes/<subcarpeta>/ segun el mapeo de categorias.
"""

from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime

SCRIPT_FOLDER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_FOLDER)

from agent_board import get_pending, mark_status
from agents import CATEGORY_TO_FOLDER
from shared_config import load_config, get_board_path, get_vault_path


def _format_frontmatter_list(items: list[str], is_link: bool = False) -> str:
    if not items:
        return "  -"
    if is_link:
        unique_items = list(dict.fromkeys(items))
        return "\n".join(f'  - "[[{item}]]"' for item in unique_items)
    return "\n".join(f"  - {item}" for item in items)


def escribir_nota(vault_path: str, nodes_folder: str, msg_payload: dict) -> str:
    now = datetime.utcnow()
    ts_iso = now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    ts_filename = now.strftime("%Y%m%d%H%M%S")
    year = now.strftime("%Y")
    quarter = (now.month - 1) // 3 + 1

    enrichment = msg_payload.get("enrichment", {})
    category = msg_payload.get("category", "Metodo")

    # Determine subfolder based on category mapping
    subfolder = CATEGORY_TO_FOLDER.get(category, "thoughts")
    target_dir = os.path.join(vault_path, nodes_folder, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    title = enrichment.get("title", "sin-titulo")
    safe = "".join(c for c in title if c.isalnum() or c in (" ", "-", "_")).rstrip().replace(" ", "-")

    short_uuid = uuid.uuid4().hex[:8]
    filename = f"{ts_filename}-{safe}.md"
    filepath = os.path.join(target_dir, filename)
    while os.path.exists(filepath):
        short_uuid = uuid.uuid4().hex[:6]
        filename = f"{ts_filename}-{safe}-{short_uuid}.md"
        filepath = os.path.join(target_dir, filename)

    parser_mentions = msg_payload.get("mentions", [])
    agent_entities = enrichment.get("relations_explicit", [])
    all_explicit_relations = list(dict.fromkeys(parser_mentions + agent_entities))

    fm_tags = _format_frontmatter_list(msg_payload.get("tags", []))
    fm_relations_explicit = _format_frontmatter_list(all_explicit_relations, is_link=True)
    fm_relations_semantic = _format_frontmatter_list(enrichment.get("relations_semantic", []))
    fm_recurrence_topics = _format_frontmatter_list(enrichment.get("recurrence_topics", []))

    citas = enrichment.get("citas", [])
    preguntas = enrichment.get("preguntas", [])
    citas_bloque = ("> " + "\n> ".join(citas)) if citas else "> *No se extrajeron citas relevantes.*"
    preguntas_bloque = ("- " + "\n- ".join(preguntas)) if preguntas else "- *Que implicaciones colaterales tiene este pensamiento?*"

    frontmatter = f"""---
id: {ts_filename}
created_at: {ts_iso}
source: agente-local
category: {category}
core_nucleus: "{enrichment.get('core_nucleus', '')}"
stage_cognitive: "{enrichment.get('stage_cognitive', '')}"
tags:
{fm_tags}
relations_explicit:
{fm_relations_explicit}
relations_semantic:
{fm_relations_semantic}
recurrence_topics:
{fm_recurrence_topics}
temporal_anchor:
  period: "{year}-Q{quarter}"
  mood: ""
future_letter:
  enabled: {str(enrichment.get('future_letter', {}).get('enabled', False)).lower()}
  review_on: {enrichment.get('future_letter', {}).get('review_on') or 'null'}
---
# {title}
## Resumen Ejecutivo
{enrichment.get('resumen', 'Sin resumen disponible.')}
## Texto Original
{enrichment.get('body', msg_payload.get('raw_text', ''))}
## Citas Clave Detectadas
{citas_bloque}
## Lectura posterior
- Analizar bajo el prisma de la categoria: **{category}**
## Preguntas persistentes
{preguntas_bloque}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter)
    return filepath


def main():
    config = load_config()
    vault_path = get_vault_path(config)
    board_path = get_board_path(config)
    nodes_folder = config.get("nodes_folder", "03_nodes")
    pendientes = get_pending(board_path, "writer")

    if not pendientes:
        print("No hay mensajes pendientes para writer.")
        return

    for msg in pendientes:
        payload = msg["payload"]
        category = payload.get("category", "Metodo")
        subfolder = CATEGORY_TO_FOLDER.get(category, "thoughts")
        filepath = escribir_nota(vault_path, nodes_folder, payload)
        mark_status(board_path, msg["id"], "completado")
        print(f"📝 {msg.get('note_ref')} -> {filepath} (en {subfolder}/)")


if __name__ == "__main__":
    main()
