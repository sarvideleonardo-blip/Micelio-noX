#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agente parser: normaliza texto y extrae hechos para clasificación.

Incluye además helpers de análisis de texto (resumen, citas, preguntas)
compartidos por los agentes especializados de categoría, para que
el "modo local" haga algo más que devolver un título fijo.
"""

from __future__ import annotations

import re
import unicodedata

_SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?])\s+')
_QUOTE_RE = re.compile(r'["“”\'«»].{3,}?["“”\'«»]')
_NUMBER_RE = re.compile(r'\d')


def strip_accents(value: str) -> str:
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")


def clean_text(value: str) -> str:
    text = value.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    lines = [" ".join(line.split()) for line in text.splitlines()]
    return "\n".join(lines).strip()


def extract_facts(value: str) -> dict:
    text = clean_text(value)
    mentions = re.findall(r"\[\[([^\[\]]+)\]\]", text)
    return {
        "parsed_text": text,
        "length_chars": len(text),
        "lines": sum(1 for chunk in text.splitlines() if chunk.strip()),
        "mentions": list(dict.fromkeys(mentions)),
    }


def split_sentences(text: str) -> list[str]:
    """Divide el texto en oraciones (heurística simple, sin NLP)."""
    text = text.strip()
    if not text:
        return []
    parts = _SENTENCE_SPLIT_RE.split(text.replace("\n", " "))
    return [p.strip() for p in parts if p.strip()]


def extract_resumen(text: str, max_chars: int = 240) -> str:
    """Resumen ejecutivo: primera(s) oración(es) hasta un mínimo razonable."""
    sentences = split_sentences(text)
    if not sentences:
        return ""
    resumen = sentences[0]
    i = 1
    while len(resumen) < 80 and i < len(sentences):
        resumen += " " + sentences[i]
        i += 1
    if len(resumen) > max_chars:
        resumen = resumen[:max_chars].rstrip() + "…"
    return resumen


def extract_citas(text: str, max_citas: int = 3) -> list[str]:
    """Extrae oraciones "citables": entre comillas, o con datos concretos
    (números, fechas, cifras). Heurística, no NLP real."""
    sentences = split_sentences(text)
    citas: list[str] = []
    for s in sentences:
        if _QUOTE_RE.search(s):
            citas.append(s)
        elif _NUMBER_RE.search(s) and len(s) < 220:
            citas.append(s)
        if len(citas) >= max_citas:
            break
    return citas


def extract_preguntas_detectadas(text: str) -> list[str]:
    """Preguntas que ya estaban escritas en el texto original."""
    sentences = split_sentences(text)
    return [s for s in sentences if s.endswith("?")]


def make_title(resumen: str, fallback: str, max_chars: int = 60) -> str:
    """Genera un título corto a partir del resumen, o usa un fallback."""
    source = (resumen or "").strip() or fallback
    source = source.strip(" .")
    if not source:
        return fallback
    if len(source) > max_chars:
        return source[:max_chars].rstrip() + "…"
    return source


if __name__ == "__main__":
    sample = "Hola [[Obsidian]], esto es una nota.\n\nCon doble salto."
    print(extract_facts(sample))