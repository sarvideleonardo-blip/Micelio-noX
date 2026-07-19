#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

"""Agente especializado en categoría Cosmogonia."""
import re

from agent_parser import (
    clean_text,
    extract_resumen,
    extract_citas,
    extract_preguntas_detectadas,
    make_title,
)

PREGUNTAS_BASE = [
    "¿Qué había antes del principio que describe esta idea?",
    "¿Esta cosmogonía explica un origen o justifica un orden actual?",
]

SIMBOLOS_CLAVE = [
    "Árbol Invertido",
    "Rayo Rosa",
    "Murciélago Rosa",
    "Calcetín Verde",
    "Nave de Preguntas",
    "Guardián de Plumas Metálicas",
]


def _extract_symbols(text: str) -> list[str]:
    """Extrae símbolos clave de la mitología personal."""
    found_symbols = []
    lower_text = text.lower()
    for symbol in SIMBOLOS_CLAVE:
        # Busca el símbolo como palabra completa, ignorando mayúsculas/minúsculas
        if re.search(r'\b' + re.escape(symbol.lower()) + r'\b', lower_text):
            found_symbols.append(symbol)
    return list(dict.fromkeys(found_symbols)) # Elimina duplicados


def enrich(text: str) -> dict:
    cleaned = clean_text(text)
    core = cleaned[:120].replace("\n", " ")
    resumen = extract_resumen(cleaned)
    citas = extract_citas(cleaned)
    
    symbols = _extract_symbols(cleaned)
    preguntas = extract_preguntas_detectadas(cleaned) or PREGUNTAS_BASE
    if len(symbols) > 1:
        preguntas.append(f"¿Cómo interactúa el '{symbols[0]}' con el '{symbols[1]}', si es que lo hacen?")
    elif len(symbols) == 1:
        preguntas.append(f"¿Cuál es el rol fundamental del '{symbols[0]}' en esta mitología?")

    title = make_title(resumen, "Nota de cosmogonía")
    return {
        "core_nucleus": core,
        "stage_cognitive": "cosmogonia",
        "relations_explicit": symbols,
        "relations_semantic": ["mitologia-personal", "simbolismo"],
        "recurrence_topics": ["origen", "incertidumbre", "transformacion"],
        "future_letter": {"enabled": False, "review_on": None},
        "title": title,
        "body": cleaned,
        "resumen": resumen,
        "citas": citas,
        "preguntas": preguntas,
    }


if __name__ == "__main__":
    import json
    sample = """
    BITÁCORA DE UN COSMONAUTA DE LA INCERTIDUMBRE
    Todo comenzó con el Árbol Invertido y un Rayo Rosa.
    Mi guía es un Murciélago Rosa y mi motor un Calcetín Verde.
    """
    enriched_data = enrich(sample)
    print(json.dumps(enriched_data, ensure_ascii=False, indent=2))