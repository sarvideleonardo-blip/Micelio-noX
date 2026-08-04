#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extrae entidades del glosario de 09_escritura_premonicion.md y las clasifica."""

import re
from pathlib import Path
import json

ORIGEN = Path('/Users/mac/Desktop/nOOxcuro/05_ESCRITURA/fragmentos/09_escritura_premonicion.md')
SALIDA = Path('/Users/mac/Documents/Micelio-noX/scripts/procesadas/entidades_clasificadas.json')

def clasificar_entidades(text: str):
    # Buscar bloque de glosario de entidades (a partir de "Aquí tienes el primer bloque")
    inicio = re.search(r'Aquí tienes el primer bloque', text)
    if not inicio:
        print('No se encontró el bloque del glosario de entidades.')
        return []

    bloque = text[inicio.start():]

    # Patrón de entidad: número + nombre + (nominativo) + TIPO + FUNCIONES + DESCRIPCIÓN
    patron = re.compile(
        r'^\s*(\d+)\.\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 \-]+?)\s*\(([^)]+)\)\s*\n'
        r'\s*TIPO\s*-\s*(.+?)\s*\n'
        r'\s*FUNCIONES\s*\n(.*?)\n'
        r'\s*DESCRIPCIÓN\s*\n(.*?)(?=\n\s*\d+\.\s*[A-ZÁÉÍÓÚÜÑ]|\Z)',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    )

    entidades = []
    for num, nombre, nominativo, tipo, funciones_raw, desc_raw in patron.findall(bloque):
        funciones = [l.strip() for l in funciones_raw.strip().splitlines() if l.strip()]
        descripcion = [l.strip() for l in desc_raw.strip().splitlines() if l.strip()]

        texto_desc = ' '.join(descripcion).lower()
        # Criterio: si describe hábitat/cuerpo/orgánico -> bestiario
        bestiario = bool(re.search(
            r'habita|habita en|vive en|se encuentra en|cuerpo de|ojos|patas|alas|'
            r'vuela|criatura|serpiente|gato|sapo|polilla|niño|zorro|araña|hoyo|'
            r'piel|sangre|madera|carne|huele|come|digiere|muerde|nace|muere',
            texto_desc
        ))

        entidades.append({
            'num': int(num),
            'nombre': nombre.strip(),
            'nominativo': nominativo.strip(),
            'tipo': tipo.strip(),
            'funciones': funciones,
            'descripcion': descripcion,
            'bestiario': bestiario,
        })

    return entidades

if __name__ == '__main__':
    texto = ORIGEN.read_text(encoding='utf-8')
    entidades = clasificar_entidades(texto)

    print(f'Entidades detectadas: {len(entidades)}')
    print(f'Bestiario: {sum(1 for e in entidades if e["bestiario"])}')
    print(f'Cosmología: {sum(1 for e in entidades if not e["bestiario"])}')

    SALIDA.write_text(json.dumps(entidades, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Resultado guardado en: {SALIDA}')