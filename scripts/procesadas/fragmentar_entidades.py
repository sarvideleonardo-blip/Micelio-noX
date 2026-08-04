#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fragmenta las entidades del glosario de 09_escritura_premonicion.md en archivos individuales."""

import re
import json
from pathlib import Path

ORIGEN = Path('/Users/mac/Desktop/nOOxcuro/05_ESCRITURA/fragmentos/09_escritura_premonicion.md')
BESTIARIO_DIR = Path('/Users/mac/Desktop/nOOxcuro/03_UNIVERSO_404/bestiario')
COSMOLOGIA_DIR = Path('/Users/mac/Desktop/nOOxcuro/03_UNIVERSO_404/cosmologia')
INDICE = Path('/Users/mac/Desktop/nOOxcuro/05_ESCRITURA/fragmentos/09_escritura_premonicion_indice.md')
RESPALDO = Path('/Users/mac/Desktop/nOOxcuro/09_ARCHIVO/versiones_anteriores/09_escritura_premonicion_original.md')

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[áà]', 'a', text)
    text = re.sub(r'[éè]', 'e', text)
    text = re.sub(r'[íì]', 'i', text)
    text = re.sub(r'[óò]', 'o', text)
    text = re.sub(r'[úùü]', 'u', text)
    text = re.sub(r'[ñ]', 'n', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def clasificar_entidades(text: str):
    inicio = re.search(r'Aquí tienes el primer bloque', text)
    if not inicio:
        print('No se encontró el bloque del glosario de entidades.')
        return []

    bloque = text[inicio.start():]
    patron = re.compile(
        r'^\s*(\d+)\.\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 \-]+?)\s*\(([^)]+)\)\s*\n'
        r'\s*TIPO\s*-\s*(.+?)\s*\n'
        r'\s*FUNCIONES\s*\n(.*?)\n'
        r'\s*DESCRIPCIÓN\s*\n(.*?)(?=\n\s*\d+\.\s*[A-ZÁÉÍÓÚÜÑ]|\Z)',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    )

    entidades = []
    for num, nombre, nominativo, tipo, funciones_raw, desc_raw in patron.findall(bloque):
        num = int(num)
        nombre = nombre.strip()
        nominativo = nominativo.strip()
        tipo = tipo.strip()
        funciones = [l.strip() for l in funciones_raw.strip().splitlines() if l.strip()]
        descripcion = [l.strip() for l in desc_raw.strip().splitlines() if l.strip()]

        texto_desc = ' '.join(descripcion).lower()
        bestiario = bool(re.search(
            r'habita|habita en|vive en|se encuentra en|cuerpo de|ojos|patas|alas|'
            r'vuela|criatura|serpiente|gato|sapo|polilla|niño|zorro|araña|hoyo|'
            r'piel|sangre|madera|carne|huele|come|digiere|muerde|nace|muere',
            texto_desc
        ))

        entidades.append({
            'num': num,
            'nombre': nombre,
            'nominativo': nominativo,
            'tipo': tipo,
            'funciones': funciones,
            'descripcion': descripcion,
            'bestiario': bestiario,
        })

    return entidades

def fragmentar():
    texto = ORIGEN.read_text(encoding='utf-8')
    entidades = clasificar_entidades(texto)

    # Separar contenido real del glosario
    match_inicio = re.search(r'Aquí tienes el primer bloque', texto)
    if not match_inicio:
        print('No se encontró el bloque del glosario.')
        return

    contenido_real = texto[:match_inicio.start()].strip()
    bloque_entidades = texto[match_inicio.start():]

    # 1. Respaldo original
    RESPALDO.write_text(texto, encoding='utf-8')
    print(f'[1/5] Original respaldado en: {RESPALDO}')

    # 2. Crear índice
    indice_lines = [contenido_real, '\n---\n', '## Índice de entidades\n']
    for e in entidades:
        carpeta = 'bestiario' if e['bestiario'] else 'cosmologia'
        nombre_archivo = f'{e["num"]:03d}_{slugify(e["nombre"])}.md'
        indice_lines.append(f'- [{e["nombre"]}]({carpeta}/{nombre_archivo})')
    INDICE.write_text('\n'.join(indice_lines), encoding='utf-8')
    print(f'[2/5] Índice guardado en: {INDICE}')

    # 3. Fragmentar entidades en archivos individuales
    patron = re.compile(
        r'^\s*(\d+)\.\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 \-]+?)\s*\(([^)]+)\)\s*\n'
        r'\s*TIPO\s*-\s*(.+?)\s*\n'
        r'\s*FUNCIONES\s*\n(.*?)\n'
        r'\s*DESCRIPCIÓN\s*\n(.*?)(?=\n\s*\d+\.\s*[A-ZÁÉÍÓÚÜÑ]|\Z)',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    )

    for num, nombre, nominativo, tipo, funciones_raw, desc_raw in patron.findall(bloque_entidades):
        num = int(num)
        nombre = nombre.strip()
        nominativo = nominativo.strip()
        tipo = tipo.strip()
        funciones = [l.strip() for l in funciones_raw.strip().splitlines() if l.strip()]
        descripcion = [l.strip() for l in desc_raw.strip().splitlines() if l.strip()]

        ent = next((e for e in entidades if e['num'] == num), None)
        if ent is None:
            continue

        carpeta = BESTIARIO_DIR if ent['bestiario'] else COSMOLOGIA_DIR
        carpeta.mkdir(parents=True, exist_ok=True)
        nombre_archivo = f'{num:03d}_{slugify(nombre)}.md'
        filepath = carpeta / nombre_archivo

        fm = [
            '---',
            f'nombre: "{nombre}"',
            f'nominativo: "{nominativo}"',
            f'tipo: "{tipo}"',
            f'origen: "09_escritura_premonicion"',
            '---',
            f'# {nombre}',
            f'*{nominativo}*',
            '',
            '## Funciones',
            ''
        ]
        fm.extend(f'- {f}' for f in funciones)
        fm.append('')
        fm.append('## Descripción')
        fm.append('')
        fm.extend(f'- {d}' for d in descripcion)

        filepath.write_text('\n'.join(fm), encoding='utf-8')

    print(f'[3/5] Entidades fragmentadas en bestiario/ y cosmologia/')
    print(f'[4/5] Archivo original ya no contiene las entidades (solo índice).')
    print(f'[5/5] Proceso completo. Revisar en: {BESTIARIO_DIR} y {COSMOLOGIA_DIR}')

if __name__ == '__main__':
    fragmentar()