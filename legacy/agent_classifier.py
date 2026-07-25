#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Clasificador local de categorías con keywords aprendidas."""

import re

# Keywords base por categoría (pueden ampliarse)
CATEGORY_KEYWORDS = {
    "Metodo": ["paso", "proceso", "procedimiento", "guia", "metodo", "iteracion", "iterar", "objetivo", "protocolo"],
    "Cosmogonia": ["origen", "universo", "cosmos", "creacion", "dios", "caos", "principio", "generacion", "mito"],
    "Museo": ["museo", "exposicion", "coleccion", "obra", "artista", "galeria", "curador", "instalacion", "patrimonio"],
    "Escritura": ["escribir", "narrativa", "cuento", "poema", "estilo", "redaccion", "personaje", "estructura", "genero"],
    "Identidad": ["identidad", "yo", "ser", "persona", "historia personal", "autobiografia", "crecimiento", "experiencia", "valores"],
    "Leyes": ["ley", "norma", "codigo", "juridico", "legal", "sentencia", "regulacion", "derecho", "obligacion"],
}


def classify(text: str) -> dict:
    text_lower = text.lower()

    # Regla rápida para override explícito del usuario: 
    # "sugiero categoria: <categoria>"
    suggest_match = re.search(r"sugiero\s+categoria[:]\s*([^\n]+)", text_lower)
    suggested = None
    if suggest_match:
        suggested = suggest_match.group(1).strip().title()

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[category] = score

    best_category = max(scores, key=scores.get) if scores else "Metodo"
    best_score = scores.get(best_category, 0)

    # Si hay sugerencia explícita, priorizarla solo si no hay match claro
    if suggested and suggested in scores and best_score == 0:
        best_category = suggested

    tags = [category for category, score in scores.items() if score > 0]

    return {
        "category": best_category,
        "suggested": suggested,
        "scores": scores,
        "tags": tags,
    }