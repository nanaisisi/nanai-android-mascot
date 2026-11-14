"""
scripts/compliance/verify.py

Implementation comparison list verification, table corruption checks,
and referenced implementation path validation.
"""

import os
import re

CORRUPTED_ROW_RE = re.compile(
    r'\[\s*こ\s*\]\(\s*の\.md\s*\)|\[\s*❌\s*\]\(\s*\.md\s*\)|\]\(\s*\.md\s*\)'
)
SINGLE_CHAR_MD_LINK_RE = re.compile(
    r'\[\s*([A-Za-z\u3040-\u30ff\u4e00-\u9faf])\s*\]\(\s*([A-Za-z\u3040-\u30ff\u4e00-\u9faf]\.md)\s*\)'
)
MD_LINK_RE = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')
IMPL_PATH_RE = re.compile(
    r'(?:`|\(|\[|^|\s)(?:\.\./)*((?:src-tauri|crates|ui|tests)/[A-Za-z0-9_./\-*]+(?::\d+(?:-\d+)?)?)'
)


def has_corrupted_table_rows(content: str, dir_path: str = None) -> bool:
    """Checks if markdown table content contains corrupted vertical-slice rows."""
    for line in content.splitlines():
        if '|' not in line:
            continue
        if CORRUPTED_ROW_RE.search(line):
            return True
        for m in SINGLE_CHAR_MD_LINK_RE.finditer(line):
            target = m.group(2)
            if dir_path is None or not os.path.exists(os.path.join(dir_path, target)):
                return True
    return False


def verify_comparison_lists(docs_dir='docs/spec', compliance_dir='docs/doc/compliance', base_dir='.'):
    """
    Scans and validates the lists/tables in implementation comparison files.
    """
    from scripts.compliance.audit_helpers import (
        is_spec_item_readme,
        is_category_table_index,
        is_spec_audit_file,
    )

    master_files = []
    for mname in ('SUMMARY.md', 'ukadoc-and-ssp-master-comparison.md'):
        mpath = os.path.join(docs_dir, mname)
        if os.path.isfile(mpath):
            master_files.append(mpath)

    category_list_files = []
    if os.path.isdir(docs_dir):
        for root, dirs, files in os.walk(docs_dir):
            if 'README.md' in files:
                rpath = os.path.join(root, 'README.md')
                if not is_spec_item_readme(rpath):
                    category_list_files.append(rpath)
            if 'index.md' in files:
                ipath = os.path.join(root, 'index.md')
                if is_category_table_index(ipath):
                    category_list_files.append(ipath)

    compliance_files = []
    if compliance_dir and os.path.isdir(compliance_dir):
        for root, dirs, files in os.walk(compliance_dir):
            for f in sorted(files):
                if f.endswith('.md'):
                    compliance_files.append(os.path.join(root, f))

    corrupted_rows = []
    broken_links = []
    unlisted_leaf_specs = []
    missing_impl_paths = []
    referenced_impl_paths_checked = 0

    def to_rel(p):
        try:
            return os.path.relpath(p, base_dir).replace('\\', '/')
        except Exception:
            return p.replace('\\', '/')

    for lfile in sorted(category_list_files):
        rel_lfile = to_rel(lfile)
        ldir = os.path.dirname(lfile)
        try:
            with open(lfile, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            continue

        table_lines = [ln for ln in content.splitlines() if '|' in ln]
        if not table_lines:
            corrupted_rows.append({
                "file": rel_lfile,
                "line": 1,
                "row": "<missing markdown table>"
            })
            continue

        for line_no, line in enumerate(content.splitlines(), 1):
            if '|' not in line:
                continue
            row_is_corrupted = False
            if CORRUPTED_ROW_RE.search(line):
                row_is_corrupted = True
            else:
                for sm in SINGLE_CHAR_MD_LINK_RE.finditer(line):
                    starget = sm.group(2)
                    if not os.path.exists(os.path.join(ldir, starget)):
                        row_is_corrupted = True
                        break
            if row_is_corrupted:
                corrupted_rows.append({
                    "file": rel_lfile,
                    "line": line_no,
                    "row": line.strip()
                })

            for m in MD_LINK_RE.finditer(line):
                raw_target = m.group(2).split('#')[0].strip()
                if not raw_target or raw_target.startswith(('http://', 'https://', 'mailto:')):
                    continue
                if raw_target.endswith('.md'):
                    resolved = os.path.normpath(os.path.join(ldir, raw_target))
                    if not os.path.exists(resolved):
                        broken_links.append({
                            "file": rel_lfile,
                            "line": line_no,
                            "target": raw_target
                        })

    if os.path.isdir(docs_dir):
        for root, dirs, files in os.walk(docs_dir):
            dir_list_files = []
            if 'README.md' in files and not is_spec_item_readme(os.path.join(root, 'README.md')):
                dir_list_files.append(os.path.join(root, 'README.md'))
            if 'COVERAGE.md' in files:
                dir_list_files.append(os.path.join(root, 'COVERAGE.md'))
            if 'index.md' in files and is_category_table_index(os.path.join(root, 'index.md')):
                dir_list_files.append(os.path.join(root, 'index.md'))

            if not dir_list_files:
                continue

            combined_text = ""
            for dlf in dir_list_files:
                try:
                    with open(dlf, 'r', encoding='utf-8', errors='ignore') as f:
                        combined_text += f.read() + "\n"
                except Exception:
                    pass

            child_dirs = [d for d in dirs if os.path.isdir(os.path.join(root, d))]
            is_subcategory_index = bool(
                child_dirs and any(f"{d}/" in combined_text for d in child_dirs)
            )

            for f in sorted(files):
                if not f.endswith('.md'):
                    continue
                full_f = os.path.join(root, f)
                if not is_spec_audit_file(full_f):
                    continue
                if f in combined_text:
                    continue
                if is_subcategory_index and f.startswith(('introduction_', 'caption_', 'note-')):
                    continue
                unlisted_leaf_specs.append(to_rel(full_f))

    all_list_files = master_files + sorted(category_list_files) + sorted(compliance_files)
    for lfile in all_list_files:
        rel_lfile = to_rel(lfile)
        try:
            with open(lfile, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            continue

        for m in IMPL_PATH_RE.finditer(content):
            raw_path = m.group(1)
            clean_path = re.sub(r':\d+(?:-\d+)?$', '', raw_path).rstrip('.,;:)]`\'"')
            if not clean_path or '*' in clean_path or '{' in clean_path or '<' in clean_path:
                continue
            referenced_impl_paths_checked += 1
            resolved_impl = os.path.join(base_dir, clean_path)
            if not os.path.exists(resolved_impl):
                missing_impl_paths.append({
                    "file": rel_lfile,
                    "path": clean_path
                })

    return {
        "master_files_checked": len(master_files),
        "category_list_files_checked": len(category_list_files),
        "compliance_files_checked": len(compliance_files),
        "total_list_files_checked": len(all_list_files),
        "corrupted_rows_count": len(corrupted_rows),
        "corrupted_rows": corrupted_rows,
        "broken_links_count": len(broken_links),
        "broken_links": broken_links,
        "unlisted_leaf_specs_count": len(unlisted_leaf_specs),
        "unlisted_leaf_specs": unlisted_leaf_specs,
        "referenced_impl_paths_checked": referenced_impl_paths_checked,
        "missing_impl_paths_count": len(missing_impl_paths),
        "missing_impl_paths": missing_impl_paths,
    }
