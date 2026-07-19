#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agente especializado en categoría Escritura."""
from __future__ import annotations
from agent_base import make_agent_enrich

PREGUNTAS_BASE = [
    "¿Desde qué voz o punto de vista se está contando esto?",
    "¿Qué pasaría si este fragmento se contara al revés?",
]

enrich = make_agent_enrich("escritura", "Escritura", PREGUNTAS_BASE)

if __name__ == "__main__":
    print(enrich("Narrativa en primera persona: 'no recuerdo cuándo empezó todo esto'."))
