#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Base factory for agent enrich functions — eliminates 4 identical agent_*.py files.

These 4 agents are structurally identical (same fields, same logic):
  - agent_metodo.py
  - agent_leyes.py
  - agent_museo.py
  - agent_escritura.py

Only agent_cosmogonia.py and agent_identidad.py have custom logic and keep their own files.

Usage:
    from agent_base import make_agent_enrich
    enrich = make_agent_enrich(
        stage="metodo",
        label="Método",
        preguntas=["¿Qué paso...?"],
    )
"""

from __future__ import annotations

from agent_parser import (
    clean_text,
    extract_resumen,
    extract_citas,
    extract_preguntas_detectadas,
    make_title,
)


def make_agent_enrich(
    stage: str,
    label: str,
    preguntas: list[str],
) -> callable:
    """Factory que crea una función enrich() para cualquier categoría simple.

    Args:
        stage: valor para 'stage_cognitive' (e.g. 'metodo', 'leyes')
        label: texto humano para el título (e.g. 'Método', 'Leyes')
        preguntas: lista de preguntas por defecto

    Returns:
        Función enrich(text: str) -> dict con la estructura de enriquecimiento
    """
    title_fallback = f"Nota de {label.lower()}"

    def enrich(text: str) -> dict:
        cleaned = clean_text(text)
        core = cleaned[:120].replace("\n", " ")
        resumen = extract_resumen(cleaned)
        citas = extract_citas(cleaned)
        preguntas_detectadas = extract_preguntas_detectadas(cleaned) or preguntas[:1]
        title = make_title(resumen, title_fallback)
        return {
            "core_nucleus": core,
            "stage_cognitive": stage,
            "relations_explicit": [],
            "relations_semantic": [],
            "recurrence_topics": [],
            "future_letter": {"enabled": False, "review_on": None},
            "title": title,
            "body": cleaned,
            "resumen": resumen,
            "citas": citas,
            "preguntas": preguntas_detectadas,
            "tipo": "fragmento",
            "universo": [],
        }

    return enrich
