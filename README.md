# nOOxcuro Pipeline v3.0 — Estructura Final

## Que es

Pipeline que transforma notas de Apple Notes (o archivos .txt) en notas estructuradas de Obsidian, organizadas en la estructura definitiva del protocolo.

## Estructura de salida

```
nOOxcuro/
├── 01_project/
├── 02_logs_ia/
└── 03_nodes/
    ├── thoughts/      ← Cosmogonia, Identidad
    ├── doubts/        ← Leyes
    ├── ideas/         ← Metodo, Museo
    └── conversations/ ← Escritura
```

## Archivos

| Archivo | Que hace |
|---------|----------|
| `arquitecto.py` | Importer: saca notas de Apple Notes (SQLite) → staging/ |
| `step_parser.py` | Paso 1: lee .txt de staging, publica en tablero |
| `step_classifier.py` | Paso 2: clasifica en 6 categorias |
| `step_enrich.py` | Paso 3: enriquece con agente especializado |
| `step_writer.py` | Paso 4: escribe .md en 03_nodes/<subcarpeta>/ |
| `agent_parser.py` | Limpia texto, extrae hechos, resumen, citas |
| `agent_classifier.py` | Clasifica: Metodo/Cosmogonia/Museo/Escritura/Identidad/Leyes |
| `agent_*.py` (6) | Agentes especializados por categoria |
| `agent_board.py` | Tablero de mensajes async (markdown) |
| `agents.py` | Registro de agentes + mapeo a 03_nodes/ |
| `config.json` | Configuracion central |
| `sync.sh` | **Comando unico**: importer + pipeline completo |
| `run.sh` | Solo pipeline (si staging ya tiene .txt) |
| `install.sh` | Instalador: crea carpetas, configura paths |

## Instalacion

```bash
bash install.sh "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/nOOxcuro"
```

## Uso diario

```bash
# Todo en uno: Apple Notes → Obsidian
bash sync.sh

# O solo pipeline (si ya tienes .txt en staging/)
bash run.sh
```

## Mapeo de categorias

| Categoria | 03_nodes/ |
|-----------|-----------|
| Cosmogonia | thoughts |
| Identidad | thoughts |
| Museo | ideas |
| Escritura | conversations |
| Metodo | ideas |
| Leyes | doubts |

## Requisitos

- Python 3.8+
- `html2text` (solo para importer): `pip3 install html2text`
- Todo lo demas es libreria estandar

## Flujo

```
Apple Notes ──► arquitecto.py ──► staging/*.txt
                                      │
staging/*.txt ──► step_parser ──► tablero ──► step_classifier ──► step_enrich ──► step_writer
                                                                                    │
                                                                                    ▼
                                                                           03_nodes/<subcarpeta>/*.md