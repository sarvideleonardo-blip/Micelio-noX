#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Clasificador: decide categoría y extrae metadatos desde el texto."""

from __future__ import annotations

import json
import re
import unicodedata
from agent_parser import clean_text


def _normalize(text: str) -> str:
    """Remove accents and lowercase."""
    nfkd = unicodedata.normalize("NFKD", text)
    return nfkd.encode("ascii", "ignore").decode("ascii").lower()


def _word_in_text(word: str, lower_text: str) -> bool:
    """Busca `word` como palabra completa en texto normalizado (sin acentos).

    Evita falsos positivos como 'ser' dentro de 'observa' o 'yo' dentro de 'mayor'.
    """
    norm_word = _normalize(word)
    norm_text = _normalize(lower_text)
    pattern = r'\b' + re.escape(norm_word) + r'\b'
    return re.search(pattern, norm_text) is not None


CATEGORIES = ["Metodo", "Cosmogonia", "Museo", "Escritura", "Identidad", "Leyes"]

DEFAULT_KEYWORDS: dict[str, list[str]] = {
    "Metodo": [
        "paso", "proceso", "procedimiento", "guia", "metodo",
        "iteracion", "iterar", "objetivo", "protocolo",
    ],
    "Cosmogonia": [
        "origen", "universo", "cosmos", "creacion", "dios",
        "caos", "principio", "generacion", "mito",
    ],
    "Museo": [
        "museo", "exposicion", "coleccion", "obra", "artista",
        "galeria", "curador", "instalacion", "patrimonio",
    ],
    "Escritura": [
        "escribir", "narrativa", "cuento", "poema", "estilo",
        "redaccion", "personaje", "estructura", "genero",
    ],
    "Identidad": [
        "identidad", "yo", "ser", "persona", "historia personal",
        "autobiografia", "crecimiento", "experiencia", "valores",
    ],
    "Leyes": [
        "ley", "norma", "codigo", "juridico", "legal",
        "sentencia", "regulacion", "derecho", "obligacion",
    ],
}

learned_keywords: dict[str, list[str]] = {k: list(v) for k, v in DEFAULT_KEYWORDS.items()}


def _autoeval_suggested_category(text: str) -> str | None:
    match = re.search(r"sugiero categoria:\s*([A-Za-z]+)", text, flags=re.IGNORECASE)
    if match:
        candidate = match.group(1).capitalize()
        return candidate if candidate in CATEGORIES else None
    return None


def _boost_from_autoeval(text: str, scores: dict[str, int], config_boost: int = 3) -> dict[str, int]:
    suggested = _autoeval_suggested_category(text)
    if suggested and suggested in scores:
        scores[suggested] += config_boost
    return scores


def _score(text: str) -> dict[str, int]:
    cleaned = clean_text(text)
    lower = cleaned.lower()
    scores = {category: 0 for category in CATEGORIES}

    for category, keywords in learned_keywords.items():
        for word in keywords:
            if _word_in_text(word, lower):
                scores[category] += 2
    scores = _boost_from_autoeval(text, scores)
    return scores


def classify(text: str) -> dict:
    scores = _score(text)
    category = max(scores, key=scores.get)
    if scores[category] == 0:
        category = "Metodo"

    lower = clean_text(text).lower()
    tags = [word for word in lower.replace("\n", " ").split(" ") if len(word) > 4][:5]

    return {
        "category": category,
        "tags": tags,
        "scores": scores,
        "stage_cognitive": "captura",
    }


def suggest_improvements(text: str) -> dict:
    scores = _score(text)
    category = max(scores, key=scores.get)
    suggestions: list[str] = []
    if scores[category] <= 2:
        suggestions.append(
            "La clasificación actual es débil; podés agregar una línea tipo: "
            "`sugiero categoria: <Metodo|Cosmogonia|Museo|Escritura|Identidad|Leyes>`."
        )
    if "sugiero categoria:" in text.lower():
        suggestions.append("Se detectó una sugerencia; el clasificador la usa para priorizar esa categoría.")
    return {
        "category": category,
        "suggestions": suggestions,
        "scores": scores,
    }


if __name__ == "__main__":
    sample = "Guia paso a paso del proceso creativo."
    print(json.dumps(classify(sample), ensure_ascii=False, indent=2))
