#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

"""Agente especializado en categoría Identidad."""
import os
from datetime import datetime
import re

from agent_parser import (
    clean_text,
    extract_resumen,
    extract_citas,
    extract_preguntas_detectadas,
    make_title,
)

AGENT_NAME = "identidad"
STATE_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "Meta", "states"))

PREGUNTAS_BASE = [
    "¿Esta idea describe quién sos ahora o quién dejaste de ser?",
    "¿Qué versión anterior tuya estaría en desacuerdo con esto?",
    "¿Qué evento o persona fue el catalizador de esta transformación?",
]


def _write_postit(notes: str):
    """Escribe las notas de estado del agente (protocolo Post-it)."""
    os.makedirs(STATE_DIR, exist_ok=True)
    filepath = os.path.join(STATE_DIR, f"{AGENT_NAME}.md")
    now = datetime.utcnow().isoformat()
    content = f"""---
agent: {AGENT_NAME}
last-run: "{now}"
---

## Post-it

{notes[:1000]}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def _read_postit() -> str:
    """Lee las notas de estado del agente."""
    filepath = os.path.join(STATE_DIR, f"{AGENT_NAME}.md")
    return open(filepath).read() if os.path.exists(filepath) else "Sin estado previo."

def _extract_entities(text: str) -> list[str]:
    """Extrae entidades mencionadas en mayúsculas o entre paréntesis."""
    # Busca (Vivencial - Entidad)
    vivencial = re.findall(r"\((?:Vivencial|Teorías) - ([\w\s]+)\)", text, re.IGNORECASE)
    # Busca entidades en mayúsculas que no sean acrónimos cortos.
    mayusculas = re.findall(r"\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)\b", text)
    
    entities = [e.strip() for e in vivencial + mayusculas]
    # Filtra duplicados y entidades comunes que no aportan valor
    unique_entities = list(dict.fromkeys(entities))
    return [e for e in unique_entities if e.lower() not in ["teorema", "postulado", "leyes", "el", "la", "los", "las", "un", "una"]]


def _extract_theorems(text: str) -> list[str]:
    """Extrae los nombres de los teoremas o leyes personales."""
    theorems = re.findall(r"TEOREMA\s[\w\d]+:\s?(.*?)\s*\(", text, re.IGNORECASE)
    postulados = re.findall(r"Postulado de la (.*?):", text, re.IGNORECASE)
    return [t.strip() for t in theorems + postulados]


def enrich(text: str) -> dict:
    # Leer estado anterior al inicio de la ejecución
    last_state = _read_postit()

    cleaned = clean_text(text)
    core = cleaned[:120].replace("\n", " ")
    resumen = extract_resumen(cleaned)
    citas = extract_citas(cleaned)
    
    # Lógica mejorada
    entities = _extract_entities(cleaned)
    theorems = _extract_theorems(cleaned)
    
    preguntas = extract_preguntas_detectadas(cleaned) or PREGUNTAS_BASE
    if theorems:
        preguntas.append(f"¿Cómo se manifiesta el '{theorems[0]}' en tu día a día?")

    # Escribir nuevo estado al final de la ejecución
    postit_notes = f"""- Último texto procesado: "{core}..."
- Entidades extraídas: {len(entities)}
- Teoremas extraídos: {len(theorems)}
"""
    _write_postit(postit_notes)
    title = make_title(resumen, "Nota de identidad")
    return {
        "core_nucleus": core,
        "stage_cognitive": "identidad",
        "relations_explicit": entities, # Ahora poblamos esto
        "relations_semantic": theorems, # Usamos este campo para los teoremas
        "recurrence_topics": ["identidad", "relaciones", "fisica-cuantica"],
        "future_letter": {"enabled": False, "review_on": None},
        "title": title,
        "body": cleaned,
        "resumen": resumen,
        "citas": citas,
        "preguntas": preguntas,
    }


if __name__ == "__main__":
    import json

    # --- Demo con texto inline ---
    sample = "TEOREMA Alfa: La identidad es un proceso, no un estado. (Vivencial - Yo). Postulado de la dualidad: dos verdades coexisten."
    enriched_data = enrich(sample)
    print(json.dumps(enriched_data, ensure_ascii=False, indent=2))
    print("\nEntidades extraídas:", enriched_data.get("relations_explicit"))
    print("Teoremas extraídos:", enriched_data.get("relations_semantic"))