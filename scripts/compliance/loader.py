"""
scripts/compliance/loader.py

Codebase loading, architectural layer classification, snippet sanitization,
and code match validation.
"""

import os
import re
from scripts.compliance.config import GENERIC_KEYWORDS


def classify_layer(path_str: str) -> str:
    """Classifies a repository-relative file path into an architectural layer."""
    norm = path_str.replace("\\", "/")
    if norm.startswith("./"):
        norm = norm[2:]
    if norm.startswith("crates/"):
        return "core"
    if norm.startswith("src-tauri/"):
        return "backend"
    if norm.startswith("ui/"):
        if norm.startswith(("ui/ts/ui/", "ui/windows/", "ui/css/")):
            return "ui_view"
        subpath = norm[len("ui/"):]
        if "/" not in subpath and subpath.endswith((".html", ".css")):
            return "ui_view"
        return "ui_logic"
    if norm.startswith("tests/"):
        return "tests"
    return "other"


def is_valid_code_match(term, line_str, path_str):
    stripped = line_str.strip()
    if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*") or stripped.startswith("//!") or stripped.startswith("///") or stripped.startswith("#"):
        if not (term.startswith("\\") or term.startswith("On") or "." in term):
            return False

    if path_str.endswith(".json") and term.lower() in GENERIC_KEYWORDS:
        return False

    if re.match(r'^[A-Za-z0-9_.]+$', term) and term.lower() not in GENERIC_KEYWORDS:
        pattern = r'\b' + re.escape(term) + r'\b'
        if not re.search(pattern, line_str):
            return False

    return True


def sanitize_snippet(text):
    text = re.sub(r'[A-Za-z]:\\Users\\[^\\"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/Users/[^/"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:\\project\\rust\\nanai-android-mascot\\?', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/project/rust/nanai-android-mascot/?', '', text, flags=re.IGNORECASE)
    return text


def load_codebase(base_dir="."):
    codebase = []
    search_dirs = [
        os.path.join(base_dir, 'src-tauri'),
        os.path.join(base_dir, 'crates'),
        os.path.join(base_dir, 'ui'),
        os.path.join(base_dir, 'tests')
    ]
    ignore_dirs = {
        'target', 'build', '.gradle', '.cxx', 'node_modules', 'dist', 'gen',
        'coverage', 'docs', '.git', '.jules'
    }
    for root_dir in search_dirs:
        if not os.path.exists(root_dir):
            continue
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file.endswith(('.rs', '.ts', '.js', '.css', '.html', '.cpp', '.h', '.c', '.json')):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, base_dir).replace('\\', '/')
                    try:
                        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = f.readlines()
                            codebase.append((rel_path, lines))
                    except Exception:
                        pass
    return codebase
