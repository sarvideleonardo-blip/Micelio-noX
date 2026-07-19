#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
setup_protocolo.py: Genera la estructura de carpetas y archivos base
para el protocolo de Constelaciones Rizomiceliales nOOxcuro.
"""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent  # corregido: el script vive en la raiz del repo

# 26 carpetas del protocolo
# Nomenclatura definitiva: la ya existente y poblada en el vault real
# (corregido para no crear una tercera estructura en paralelo - ver
# comentario de Claude en logs/sessions/claude_2026-07-19_002.md)
FOLDERS = [
    "00_META",
    "01_PROYECTO",
    "02_logs_ia",
    "02_logs_ia/claude",
    "02_logs_ia/kimi",
    "02_logs_ia/gemini",
    "02_logs_ia/copilot",
    "02_logs_ia/qween",
    "02_logs_ia/mistral",
    "02_logs_ia/cline",
    "03_UNIVERSO_404",
    "04_PENSARES",
    "04_PENSARES/reflexiones",
    "04_PENSARES/preguntas",
    "04_PENSARES/conexiones",
    "05_ESCRITURA",
    "05_ESCRITURA/conversaciones",
    "06_PROYECTOS",
    "06_PROYECTOS/activos",
    "07_SISTEMA",
    "08_BITACORA",
    "09_ARCHIVO",
    "logs",
    "logs/sessions",
]

# Archivos base con contenido mínimo
BASE_FILES = {
    "00_META/PROTOCOLO.md": "# PROTOCOLO\n\nPendiente: pegar el texto completo del protocolo aquí.\n",
    "01_PROYECTO/Estado Actual.md": "# Estado Actual\n\nÚltima actualización: 2026-07-18\n\nPipeline funcionando de punta a punta.\n",
    "01_PROYECTO/Roadmap.md": "# Roadmap\n\n- [x] Fase 1: Setup inicial\n- [x] Fase 2: Pipeline unificado\n- [ ] Fase 3: Integración Apple Notes\n",
    "01_PROYECTO/Coordinación.md": "# Coordinación de IAs\n\nRegistro de sesiones y tareas pendientes entre instancias.\n",
    "CHANGELOG.md": "# Changelog\n\n## [Unreleased]\n- Inicio del proyecto\n",
    "README.md": "# Constelaciones Rizomiceliales nOOxcuro\n\nProyecto de micelio cognitivo con orquestación multi-IA.\n",
}


def setup():
    print("--- 🚀 Iniciando setup_protocolo ---")
    for folder in FOLDERS:
        folder_path = PROJECT_ROOT / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        print(f"📁 {folder}")

    for file_path, content in BASE_FILES.items():
        full_path = PROJECT_ROOT / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"📄 {file_path}")

    print("--- ✅ Setup completado ---")


if __name__ == "__main__":
    setup()