"""
scripts/compliance/search.py

Keyword parsing, wildcard regex compilation, codebase searching,
match selection, and layer reachability summary initialization.
"""

import re
from scripts.compliance.config import (
    GENERIC_KEYWORDS,
    KNOWN_LAYERS,
    LAYER_ORDER,
    MAX_MATCHES_PER_LAYER,
    MAX_IMPL_LOCATIONS,
)
from scripts.compliance.loader import (
    classify_layer,
    is_valid_code_match,
    sanitize_snippet,
)


def init_layer_summary():
    """Creates an initialized layer reachability summary dictionary."""
    return {
        "core_only": 0,
        "ui_connected": 0,
        "full_pipeline": 0,
        "by_layer": {layer: 0 for layer in KNOWN_LAYERS},
    }


def select_representative_matches(matches, max_lines=MAX_IMPL_LOCATIONS):
    """Selects up to `max_lines` representative matches, at least one per matched layer."""
    if not matches or max_lines <= 0:
        return []
    by_layer = {}
    for match in matches:
        layer = classify_layer(match[0])
        by_layer.setdefault(layer, []).append(match)

    ordered_layers = [layer for layer in LAYER_ORDER if layer in by_layer]
    for layer in by_layer:
        if layer not in ordered_layers:
            ordered_layers.append(layer)

    selected = []
    indices = {layer: 0 for layer in ordered_layers}
    while len(selected) < max_lines:
        progressed = False
        for layer in ordered_layers:
            idx = indices[layer]
            layer_matches = by_layer[layer]
            if idx < len(layer_matches):
                selected.append(layer_matches[idx])
                indices[layer] = idx + 1
                progressed = True
                if len(selected) >= max_lines:
                    break
        if not progressed:
            break
    return selected


def parse_keywords(keyword_str):
    """Splits a keyword string by comma, slash, or pipe into distinct search terms."""
    if not keyword_str:
        return []
    if r'\n' in keyword_str:
        keyword_str = keyword_str.split(r'\n')[0]
    parts = re.split(r'[,|]', keyword_str)
    terms = []
    for p in parts:
        term = p.strip()
        if term and term.lower() not in GENERIC_KEYWORDS:
            terms.append(term)
    return terms


def build_wildcard_regex(term):
    """Builds a compiled regular expression for wildcard search terms containing '*'."""
    if '*' not in term or term == '*' or r'\*' in term:
        return None
    parts = term.split('*')
    escaped_parts = [re.escape(p) for p in parts]
    pattern = r'[a-zA-Z0-9_\-]+'.join(escaped_parts)
    return re.compile(pattern, re.IGNORECASE)


def search_keyword(keyword, codebase, cache=None, stats=None):
    """Searches for occurrences of keyword terms in the codebase."""
    terms = parse_keywords(keyword)
    if not terms:
        return []

    file_records = []
    for item in codebase:
        if len(item) == 3:
            file_records.append(item)
        else:
            path, lines = item
            file_records.append((path, lines, "".join(lines)))

    results = []
    seen = set()
    result_layer_counts = {}

    for term in terms:
        if cache is not None and term in cache:
            if stats is not None:
                stats["cache_hits"] += 1
            term_matches = cache[term]
        else:
            if stats is not None:
                stats["cache_misses"] += 1
                stats["unique_terms"] += 1
            term_matches = []
            term_layer_counts = {}
            wildcard_regex = build_wildcard_regex(term)

            for path, lines, full_text in file_records:
                if 'docs/' in path:
                    continue

                layer = classify_layer(path)
                if term_layer_counts.get(layer, 0) >= MAX_MATCHES_PER_LAYER:
                    continue

                if wildcard_regex is not None:
                    if not wildcard_regex.search(full_text):
                        continue
                    for idx, line in enumerate(lines, 1):
                        if wildcard_regex.search(line) and is_valid_code_match(term, line, path):
                            cleaned_line = sanitize_snippet(line.strip())
                            term_matches.append((path, idx, cleaned_line))
                            term_layer_counts[layer] = term_layer_counts.get(layer, 0) + 1
                            if term_layer_counts[layer] >= MAX_MATCHES_PER_LAYER:
                                break
                else:
                    if term not in full_text:
                        continue
                    for idx, line in enumerate(lines, 1):
                        if term in line and is_valid_code_match(term, line, path):
                            cleaned_line = sanitize_snippet(line.strip())
                            term_matches.append((path, idx, cleaned_line))
                            term_layer_counts[layer] = term_layer_counts.get(layer, 0) + 1
                            if term_layer_counts[layer] >= MAX_MATCHES_PER_LAYER:
                                break
            if cache is not None:
                cache[term] = term_matches

        for path, idx, cleaned_line in term_matches:
            loc = (path, idx)
            if loc in seen:
                continue
            layer = classify_layer(path)
            if result_layer_counts.get(layer, 0) >= MAX_MATCHES_PER_LAYER:
                continue
            seen.add(loc)
            results.append((path, idx, cleaned_line))
            result_layer_counts[layer] = result_layer_counts.get(layer, 0) + 1

    return results
