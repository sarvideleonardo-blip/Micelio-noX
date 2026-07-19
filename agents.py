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
CATEGORY_TO_FOLDER: dict[str, str] = {
    "Cosmogonia": "04_PENSARES/reflexiones",
    "Identidad": "04_PENSARES/reflexiones",
    "Museo": "06_PROYECTOS/activos",
    "Escritura": "05_ESCRITURA/conversaciones",
    "Metodo": "06_PROYECTOS/activos",
    "Leyes": "04_PENSARES/preguntas",
}