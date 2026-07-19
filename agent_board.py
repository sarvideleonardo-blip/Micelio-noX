#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tablero asincrónico de mensajes entre agentes (Meta/agent-messages.md).

Cada paso del pipeline (parser, classifier, enrich, writer) es independiente:
lee los mensajes 'pendiente' dirigidos a su step, los procesa, y publica un
mensaje nuevo para el siguiente step. No hay llamada directa entre pasos:
toda la coordinación pasa por este archivo markdown, que Cline (o cualquier
proceso) puede leer y escribir.

Formato de cada mensaje en el archivo:

    ## MSG-<id de 8 hex>
    - status: pendiente | en_proceso | completado | error
    - step: paso que debe CONSUMIR el mensaje (parser, classifier, enrich, writer)
    - note_ref: identificador de la nota/captura relacionada
    - created_at: timestamp ISO
    - updated_at: timestamp ISO

    ```json
    { ... payload para ese paso ... }
    ```

LIMITACIÓN CONOCIDA: no hay locking real. Si dos procesos escriben al mismo
tiempo sobre el mismo archivo, gana el último en escribir (last-write-wins).
Para uso personal / no concurrente esto es aceptable. Si se vuelve un
problema, agregar un lockfile simple (crear .lock, esperar, borrar) antes
de _write_board.
"""

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime

HEADER_RE = re.compile(r'^## MSG-([a-f0-9]{8})\s*$')
FIELD_RE = re.compile(r'^- (\w+):\s?(.*)$')

BOARD_TEMPLATE = """# Tablero de Mensajes entre Agentes — noXcuro

<!--
Cada mensaje es un bloque "## MSG-<id>" con campos "- clave: valor"
(status, step, note_ref, created_at, updated_at) y un payload ```json.
status: pendiente | en_proceso | completado | error
step: paso que debe CONSUMIR el mensaje (parser, classifier, enrich, writer)
Cada script de paso (step_*.py) lee los 'pendiente' de su step, los procesa,
marca completado/error, y publica un mensaje nuevo para el siguiente step.
-->
"""


def _now_iso() -> str:
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _ensure_board(path: str) -> None:
    if not os.path.exists(path):
        folder = os.path.dirname(path)
        if folder:
            os.makedirs(folder, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(BOARD_TEMPLATE)


def read_board(path: str) -> list[dict]:
    """Lee y parsea todos los mensajes del tablero."""
    _ensure_board(path)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    messages: list[dict] = []
    blocks = re.split(r'\n(?=## MSG-)', content)
    for block in blocks:
        stripped = block.strip()
        if not stripped.startswith("## MSG-"):
            continue
        header_match = HEADER_RE.match(stripped.splitlines()[0])
        if not header_match:
            continue
        msg_id = header_match.group(1)
        fields: dict = {"id": msg_id}
        payload: dict = {}
        json_match = re.search(r'```json\s*\n(.*?)\n```', block, flags=re.DOTALL)
        if json_match:
            try:
                payload = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                payload = {}
        for line in block.splitlines():
            fm = FIELD_RE.match(line)
            if fm:
                fields[fm.group(1)] = fm.group(2)
        fields["payload"] = payload
        messages.append(fields)
    return messages


def _render_message(msg: dict) -> str:
    lines = [f"## MSG-{msg['id']}"]
    for key in ("status", "step", "note_ref", "created_at", "updated_at"):
        lines.append(f"- {key}: {msg.get(key, '')}")
    lines.append("")
    lines.append("```json")
    lines.append(json.dumps(msg.get("payload", {}), ensure_ascii=False, indent=2))
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def _write_board(path: str, messages: list[dict]) -> None:
    body = "\n".join(_render_message(m) for m in messages)
    with open(path, "w", encoding="utf-8") as f:
        f.write(BOARD_TEMPLATE + "\n" + body)


def post_message(path: str, step: str, note_ref: str, payload: dict, status: str = "pendiente") -> str:
    """Publica un mensaje nuevo en el tablero. Devuelve el id del mensaje."""
    messages = read_board(path)
    now = _now_iso()
    msg_id = uuid.uuid4().hex[:8]
    messages.append({
        "id": msg_id,
        "status": status,
        "step": step,
        "note_ref": note_ref,
        "created_at": now,
        "updated_at": now,
        "payload": payload,
    })
    _write_board(path, messages)
    return msg_id


def get_pending(path: str, step: str) -> list[dict]:
    """Mensajes con status=pendiente dirigidos a `step`."""
    return [m for m in read_board(path) if m.get("step") == step and m.get("status") == "pendiente"]


def mark_status(path: str, msg_id: str, status: str, extra_payload: dict | None = None) -> None:
    """Actualiza el status de un mensaje (y opcionalmente fusiona datos en su payload)."""
    messages = read_board(path)
    now = _now_iso()
    for m in messages:
        if m["id"] == msg_id:
            m["status"] = status
            m["updated_at"] = now
            if extra_payload:
                m["payload"].update(extra_payload)
            break
    _write_board(path, messages)


if __name__ == "__main__":
    demo_path = "/tmp/agent-messages-demo.md"
    if os.path.exists(demo_path):
        os.remove(demo_path)
    mid = post_message(demo_path, step="classifier", note_ref="demo-1", payload={"parsed_text": "hola"})
    print("Publicado:", mid)
    print("Pendientes para classifier:", get_pending(demo_path, "classifier"))
    mark_status(demo_path, mid, "completado")
    print("Pendientes tras marcar completado:", get_pending(demo_path, "classifier"))