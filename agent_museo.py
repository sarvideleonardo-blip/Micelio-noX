#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agente especializado en categoría Museo."""
from __future__ import annotations
from agent_base import make_agent_enrich

PREGUNTAS_BASE = [
    "¿En qué sala del museo (no por disciplina, por obsesión) encajaría esta pieza?",
    "¿Qué obsesión revela esta obra/colección que no es evidente a primera vista?",
]

enrich = make_agent_enrich("museo", "Museo", PREGUNTAS_BASE)

if __name__ == "__main__":
    print(enrich("La exposición contemporánea reunió 40 obras del artista en la galería."))
