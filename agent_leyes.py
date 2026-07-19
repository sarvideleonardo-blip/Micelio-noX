#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agente especializado en categoría Leyes."""
from __future__ import annotations
from agent_base import make_agent_enrich

PREGUNTAS_BASE = [
    "¿Qué caso límite dejaría esta norma sin cubrir?",
    "¿A quién beneficia esta regla y a quién deja afuera?",
]

enrich = make_agent_enrich("leyes", "Leyes", PREGUNTAS_BASE)

if __name__ == "__main__":
    print(enrich("Artículo 12: la norma establece 3 excepciones al régimen general."))
