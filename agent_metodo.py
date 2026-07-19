#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agente especializado en categoría Metodo."""
from __future__ import annotations
from agent_base import make_agent_enrich

PREGUNTAS_BASE = [
    "¿Qué paso de este proceso es el más frágil o menos probado?",
    "¿Qué pasaría si se invirtiera el orden de los pasos?",
]

enrich = make_agent_enrich("metodo", "Método", PREGUNTAS_BASE)

if __name__ == "__main__":
    print(enrich("Paso 1: definir objetivo. Paso 2: iterar. En 3 días se revisa el resultado."))
