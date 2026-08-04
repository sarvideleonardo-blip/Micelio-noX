#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_arbol_vault.py (v2 - con ramas de subcarpetas)
--------------------------------------------------------
Genera una imagen PNG tipo "árbol genealógico" con la estructura de
carpetas del vault de Obsidian: raíz -> categorías -> subcarpetas,
cada nivel conectado con líneas propias.

Requisitos: solo matplotlib.
Si falta: pip3 install matplotlib --break-system-packages

Uso:
    python3 generar_arbol_vault.py
"""

import os
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from matplotlib.lines import Line2D

VAULT_PATH = os.path.expanduser("~/Desktop/nOOxcuro")
OUTPUT_PATH = os.path.join(os.getcwd(), "arbol_vault_nooxcuro.png")

COLORS = {
    "sistema":   {"fill": "#F1EFE8", "border": "#5F5E5A", "text": "#2C2C2A"},
    "universo":  {"fill": "#EEEDFE", "border": "#534AB7", "text": "#26215C"},
    "pensares":  {"fill": "#E1F5EE", "border": "#0F6E56", "text": "#04342C"},
    "escritura": {"fill": "#FAECE7", "border": "#993C1D", "text": "#4A1B0C"},
    "proyectos": {"fill": "#EAF3DE", "border": "#3B6D11", "text": "#173404"},
}

CATEGORY_MAP = {
    "00_META": "sistema", "01_PROYECTO": "sistema", "02_logs_ia": "sistema",
    "03_UNIVERSO_404": "universo", "04_PENSARES": "pensares",
    "05_ESCRITURA": "escritura", "06_PROYECTOS": "proyectos",
    "07_SISTEMA": "sistema", "08_BITACORA": "sistema", "09_ARCHIVO": "sistema",
}

IGNORAR = {".git", ".obsidian", ".claude", ".claudian", ".smart-env", ".DS_Store", "_archivo_legado"}

# Layout (unidades de datos, no pixeles)
ROOT_X = 6
CAT_X = 24
LEAF_X = 46
CAT_W = 14
LEAF_W = 22
ROW_H = 1.0
GAP_ENTRE_CATEGORIAS = 0.6


def leer_estructura(vault_path):
    estructura = {}
    if not os.path.isdir(vault_path):
        print(f"No encuentro el vault en {vault_path}, uso datos de ejemplo.")
        return None
    for nombre in sorted(os.listdir(vault_path)):
        if nombre in IGNORAR or not os.path.isdir(os.path.join(vault_path, nombre)):
            continue
        if nombre not in CATEGORY_MAP:
            continue
        subcarpetas = sorted(
            d for d in os.listdir(os.path.join(vault_path, nombre))
            if os.path.isdir(os.path.join(vault_path, nombre, d)) and not d.startswith(".")
        )
        estructura[nombre] = subcarpetas
    return estructura


def caja(ax, x, y, w, h, fill, border, redondeo=0.25):
    ax.add_patch(FancyBboxPatch(
        (x - w / 2, y - h / 2), w, h,
        boxstyle=f"round,pad=0.05,rounding_size={redondeo}",
        facecolor=fill, edgecolor=border, linewidth=1.0
    ))


def linea(ax, x1, y1, x2, y2, color="#B4B2A9", lw=0.8):
    ax.add_line(Line2D([x1, x2], [y1, y2], color=color, linewidth=lw, zorder=0))


def dibujar_arbol(estructura):
    # --- Precalcular alturas ---
    filas_por_categoria = []
    total_rows = 0
    for categoria, subs in estructura.items():
        n_sub = max(1, len(subs))
        filas_por_categoria.append((categoria, subs, n_sub))
        total_rows += n_sub + GAP_ENTRE_CATEGORIAS

    fig_h = max(8, total_rows * 0.32)
    fig, ax = plt.subplots(figsize=(11, fig_h))
    ax.set_xlim(0, 75)
    ax.set_ylim(-1, total_rows + 2)
    ax.invert_yaxis()
    ax.axis("off")

    root_y = -0.5
    caja(ax, ROOT_X, root_y, 9, 1.4, "#2C2C2A", "#2C2C2A", redondeo=0.3)
    ax.text(ROOT_X, root_y, "nOOxcuro", ha="center", va="center",
             fontsize=11, color="white", fontweight="bold")

    current_y = 0.5
    for categoria, subs, n_sub in filas_por_categoria:
        color_key = CATEGORY_MAP.get(categoria, "sistema")
        colores = COLORS[color_key]

        cat_center_y = current_y + (n_sub - 1) / 2

        # Rama raiz -> categoria
        linea(ax, ROOT_X + 4.5, root_y, CAT_X - CAT_W / 2, cat_center_y)

        # Caja de categoria
        caja(ax, CAT_X, cat_center_y, CAT_W, min(1.6, n_sub * 0.9), colores["fill"], colores["border"])
        ax.text(CAT_X, cat_center_y, categoria, ha="center", va="center",
                 fontsize=9, color=colores["text"], fontweight="bold")

        # Ramas categoria -> cada subcarpeta (hoja individual)
        subs_mostrar = subs if subs else ["(vacía)"]
        for j, sub in enumerate(subs_mostrar):
            leaf_y = current_y + j
            linea(ax, CAT_X + CAT_W / 2, cat_center_y, LEAF_X - LEAF_W / 2, leaf_y,
                  color=colores["border"], lw=0.6)
            caja(ax, LEAF_X, leaf_y, LEAF_W, 0.75, colores["fill"], colores["border"], redondeo=0.15)
            ax.text(LEAF_X, leaf_y, sub, ha="center", va="center",
                     fontsize=7.5, color=colores["text"])

        current_y += n_sub + GAP_ENTRE_CATEGORIAS

    # --- Leyenda ---
    leyenda_y = total_rows + 1
    leyenda_items = [
        ("sistema", "sistema"), ("universo", "universo 404"),
        ("pensares", "pensares"), ("escritura", "escritura"),
        ("proyectos", "proyectos"),
    ]
    x0 = 6
    for key, label in leyenda_items:
        colores = COLORS[key]
        caja(ax, x0, leyenda_y, 2.2, 0.8, colores["fill"], colores["border"], redondeo=0.1)
        ax.text(x0 + 2.4, leyenda_y, label, ha="left", va="center", fontsize=8)
        x0 += 13

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight", facecolor="white")
    print(f"Imagen generada: {OUTPUT_PATH}")


ESTRUCTURA_EJEMPLO = {
    "00_META": ["readme", "protocolo", "changelog", "estructura"],
    "01_PROYECTO": ["estado actual", "roadmap", "coordinacion"],
    "02_logs_ia": ["chatgpt", "claude", "cline", "copilot", "gemini", "kimi", "mistral", "qween"],
    "03_UNIVERSO_404": ["bestiario", "cosmologia", "manifiestos", "personajes"],
    "04_PENSARES": ["reflexiones", "preguntas", "conexiones", "teorias"],
    "05_ESCRITURA": ["finales", "fragmentos", "en_proceso", "aforismos", "conversaciones"],
    "06_PROYECTOS": ["activos", "exploracion", "congelados"],
    "07_SISTEMA": ["scripts", "templates", "protocolos"],
    "08_BITACORA": ["pendiente", "en_proceso", "completado"],
    "09_ARCHIVO": ["versiones_anteriores", "descartados"],
}

if __name__ == "__main__":
    estructura = leer_estructura(VAULT_PATH)
    if not estructura:
        estructura = ESTRUCTURA_EJEMPLO
    dibujar_arbol(estructura)
