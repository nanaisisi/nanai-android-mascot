"""
scripts/compliance/git_safety.py

Git conflict detection and parallel branch safety checks.
"""

import os
import re
import subprocess


def detect_git_conflicts(docs_dir='docs/spec'):
    """
    Scans markdown and doc files under docs_dir for unresolved Git merge conflict markers.
    """
    conflict_patterns = [
        re.compile(r'^(<{7}|={7}|>{7})(?:\s+.*)?$')
    ]
    conflicts = []
    if not os.path.exists(docs_dir):
        return conflicts

    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith(('.md', '.txt')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, docs_dir).replace('\\', '/')
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_idx, line in enumerate(f, 1):
                            line_stripped = line.strip()
                            for pat in conflict_patterns:
                                if pat.match(line_stripped):
                                    conflicts.append({
                                        "file": rel_path,
                                        "path": full_path.replace('\\', '/'),
                                        "line": line_idx,
                                        "marker": line_stripped
                                    })
                                    break
                except Exception:
                    pass
    return conflicts


def is_parallel_branch():
    """
    Detects whether the current Git environment is running on a parallel feature/slot branch.
    """
    if os.environ.get("PARALLEL_SLOT") or os.environ.get("PARALLEL_WORKER"):
        return True
    try:
        branch = subprocess.check_output(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()
        if branch and branch not in ('main', 'master', 'HEAD'):
            return True
    except Exception:
        pass
    return False


def validate_parallel_bulk_safety(args):
    """
    Validates that a live bulk audit update won't introduce massive Git merge conflicts.
    """
    if args.dry_run or args.update_summary_only or args.summary_only:
        return True, "Safe mode / dry-run active."
    if args.target_category:
        return True, f"Target category '{args.target_category}' specified; bounded scope."
    if getattr(args, 'allow_bulk_overwrite', False):
        return True, "Explicit --allow-bulk-overwrite granted."

    if is_parallel_branch():
        return False, (
            "Safety Guard: Bulk modification of hundreds of individual spec audit markdown files is blocked "
            "on parallel feature branches to prevent massive Git merge conflicts across 15 development slots.\n"
            "Options:\n"
            "  1. Use '--update-summary-only' to safely update aggregate metrics in docs/spec/SUMMARY.md.\n"
            "  2. Use '--dry-run' (or '--check') to inspect compliance without touching files.\n"
            "  3. Use '--target <category>' to audit and update a specific bounded category.\n"
            "  4. Use '--allow-bulk-overwrite' if you are intentionally performing a full repository synchronization."
        )
    return True, "On main branch."
