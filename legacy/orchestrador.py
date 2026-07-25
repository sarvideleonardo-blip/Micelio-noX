#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Orquestador: coordina parser, clasificador y agente especializado para generar notas en Obsidian."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

from agent_parser import extract_facts
from agent_classifier import classify
from agents import AGENTS


def build_note(raw_text: str, vault_path: str, nodes_folder: str = "01_nodes") -> str:
    """Genera una nota estructurada en formato Markdown con frontmatter YAML.

    Args:
        raw_text: Texto plano capturado desde inbox o entrada del usuario.
        vault_path: Ruta al vault de Obsidian.
        nodes_folder: Subdirectorio donde se guardan las notas (por defecto '01_nodes').

    Returns:
        Ruta completa del archivo generado.
    """
    facts = extract_facts(raw_text)
    classification = classify(facts["parsed_text"])
    category = classification.get("category", "Metodo")
    agent_fn = AGENTS.get(category, AGENTS.get("Metodo"))
    enrichment = agent_fn(facts["parsed_text"])

    now = datetime.now(timezone.utc)
    ts = now.strftime("%Y-%m-%dT%H-%M-%S-%f") + "Z"
    ts_iso = now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    year = now.strftime("%Y")
    quarter = (now.month - 1) // 3 + 1
    title = enrichment.get("title", "sin-titulo")
    safe = "".join(c for c in title if c.isalnum() or c in (" ", "-", "_")).rstrip().replace(" ", "-")

    nodes_dir = os.path.join(os.path.expanduser(vault_path), nodes_folder)
    os.makedirs(nodes_dir, exist_ok=True)

    short_uuid = uuid.uuid4().hex[:8]
    filename = f"{ts} - {safe} - {short_uuid}.md"
    filepath = os.path.join(nodes_dir, filename)
    while os.path.exists(filepath):
        short_uuid = uuid.uuid4().hex[:8]
        filename = f"{ts} - {safe} - {short_uuid}.md"
        filepath = os.path.join(nodes_dir, filename)

    tags = classification.get("tags", [])
    mentions = facts.get("mentions", [])
    fm_tags = "\n".join(f"  - {t}" for t in tags) if tags else "  -"
    fm_rel = "\n".join(f'  - "[[{m}]]"' for m in mentions) if mentions else "  -"

    # Construcción segura del frontmatter, escapando comillas si es necesario
    def safe_yaml_str(s: str) -> str:
        return s.replace('"', "'")

    frontmatter = f"""---
id: {ts}
created_at: {ts_iso}
source: agente
category: {category}
core_nucleus: "{safe_yaml_str(enrichment.get('core_nucleus', ''))}"
stage_cognitive: "{safe_yaml_str(enrichment.get('stage_cognitive', ''))}"
tags:
{fm_tags}
relations_explicit:
{fm_rel}
relations_semantic:
{fm_rel}
recurrence_topics:
  -
temporal_anchor:
  period: "{year}-Q{quarter}"
  mood: ""
future_letter:
  enabled: {str(enrichment.get('future_letter', {}).get('enabled', False)).lower()}
  review_on: {enrichment.get('future_letter', {}).get('review_on', 'null') if enrichment.get('future_letter', {}).get('review_on') is not None else 'null'}
---

# {title}

## Texto

{enrichment.get('body', raw_text)}

## Lectura posterior

## Preguntas persistentes
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter)

    return filepath


if __name__ == "__main__":
    sample = "Paso 1: definir objetivo. Paso 2: iterar y corregir."
    vault = os.path.expanduser("~/Library/Mobile Documents/iCloud~md~obsidian/Documents/noXcuro")
    print(build_note(sample, vault))
    