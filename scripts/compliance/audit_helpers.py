"""
scripts/compliance/audit_helpers.py

Audit file inspection and identification helpers.
"""

import os
import re


def get_actual_filename(filepath: str) -> str:
    """Returns the exact-case filename stored on disk (handling Windows case-insensitivity)."""
    dirname = os.path.dirname(filepath) or "."
    basename = os.path.basename(filepath)
    if os.path.isdir(dirname):
        try:
            for entry in os.listdir(dirname):
                if entry.lower() == basename.lower():
                    return entry
        except Exception:
            pass
    return basename


def is_spec_item_readme(filepath: str, content: str = None) -> bool:
    """Checks whether a readme.md / README.md path is a spec item file rather than a category README."""
    basename = os.path.basename(filepath)
    if basename.lower() != "readme.md":
        return False
    actual_name = get_actual_filename(filepath)
    if content is None:
        if not os.path.isfile(filepath):
            return False
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            return False
    if r"\n" in content:
        content = content.replace(r"\n", "\n")
    has_status = bool(re.search(r"-\s*\*\*対応状況\*\*:\s*([^\r\n]+)", content))
    has_readme_kw = bool(re.search(r"-\s*\*\*検索語\*\*:\s*readme\b", content, re.IGNORECASE))
    if has_readme_kw:
        return True
    if actual_name == "readme.md" and has_status:
        return True
    return False


def is_category_table_index(filepath: str, content: str = None) -> bool:
    """Checks whether an index.md file is a category table index."""
    actual_name = get_actual_filename(filepath)
    if actual_name != "index.md":
        return False
    if content is None:
        if not os.path.isfile(filepath):
            return False
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            return False
    if r"\n" in content:
        content = content.replace(r"\n", "\n")
    has_status = bool(re.search(r"-\s*\*\*対応状況\*\*:\s*([^\r\n]+)", content))
    has_table = "|" in content
    return has_table and not has_status


def is_spec_audit_file(filepath: str) -> bool:
    """Determines whether a markdown file is an individual spec item audit file."""
    actual_name = get_actual_filename(filepath)
    if actual_name in ("SUMMARY.md", "INDEX.md", "COVERAGE.md", "ukadoc-and-ssp-master-comparison.md"):
        return False
    if actual_name.lower() == "readme.md":
        return is_spec_item_readme(filepath)
    if actual_name == "index.md":
        if is_category_table_index(filepath):
            return False
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if r"\n" in content:
                content = content.replace(r"\n", "\n")
            return bool(re.search(r"-\s*\*\*対応状況\*\*:\s*([^\r\n]+)", content))
        except Exception:
            return False
    return True
