#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Parser local: extrae hechos y menciones del texto."""

import re


def extract_facts(raw_text: str) -> dict:
    parsed_text = raw_text.strip()
    mentions = re.findall(r"\[\[([^\]]+)\]\]", parsed_text)
    return {
        "parsed_text": parsed_text,
        "mentions": mentions,
    }