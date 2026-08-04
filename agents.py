#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Registro de agentes especializados."""

from __future__ import annotations

from agent_metodo import enrich as enrich_metodo
from agent_cosmogonia import enrich as enrich_cosmogonia
from agent_museo import enrich as enrich_museo
from agent_escritura import enrich as enrich_escritura
from agent_identidad import enrich as enrich_identidad
from agent_leyes import enrich as enrich_leyes

AGENTS: dict[str, callable] = {
    "Metodo": enrich_metodo,
    "Cosmogonia": enrich_cosmogonia,
    "Museo": enrich_museo,
    "Escritura": enrich_escritura,
    "Identidad": enrich_identidad,
    "Leyes": enrich_leyes,
}

# Mapeo a estructura 03_nodes/
# Nota: este mapeo se mantiene como fallback histórico, pero **step_writer.py ya no
# determina la ruta por categoría**. Ahora todo migración de Apple Notes va a
# 05_ESCRITURA/finales/, salvo que el enriquecedor marque explícitamente el caso
# como teoría (los agentes devuelven dict; la ruta real se setea en step_writer).
CATEGORY_TO_FOLDER: dict[str, str] = {
    "Cosmogonia": "04_PENSARES/teorias",
    "Identidad": "04_PENSARES/teorias",
    "Museo": "06_PROYECTOS/activos",
    "Escritura": "05_ESCRITURA/finales",
    "Metodo": "06_PROYECTOS/activos",
    "Leyes": "04_PENSARES/teorias",
}
