#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shared config loading — eliminates copy-paste across step_*.py files.

Replaces the duplicated load_config(), get_board_path(), get_vault_path()
functions that previously lived in each step_*.py file.
"""

from __future__ import annotations

import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")


def load_config() -> dict:
    """Load config.json from the project root."""
    with open(os.path.normpath(CONFIG_PATH), "r", encoding="utf-8") as f:
        return json.load(f)


def get_board_path(config: dict | None = None) -> str:
    """Resolve the board file path from config.

    board_file puede ser una ruta absoluta (vive fuera del vault, ej. en el
    repo del pipeline) o relativa al vault (comportamiento anterior).
    """
    if config is None:
        config = load_config()
    board_rel = os.path.expanduser(config.get("board_file", "Meta/agent-messages.md"))
    if os.path.isabs(board_rel):
        return board_rel
    vault = os.path.expanduser(config.get("vault_path", ""))
    return os.path.join(vault, board_rel)


def get_vault_path(config: dict | None = None) -> str:
    """Resolve the vault path from config."""
    if config is None:
        config = load_config()
    return os.path.expanduser(config.get("vault_path", ""))
