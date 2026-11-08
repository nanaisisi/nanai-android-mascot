#!/usr/bin/env python3
"""
scripts/verify_spec_compliance.py

Verifies specification implementation against all audit markdown files
in docs/spec/ukadoc-spec/ and docs/spec/ukadoc-ssp/ using automated codebase search,
updating implementation locations, statuses, and SUMMARY.md.
Provides ComplianceReport output in JSON and Markdown, dry-run checking, and category filtering.
"""

import argparse
import datetime
import glob
import json
import os
import re
import sys

GENERIC_KEYWORDS = {
    "number", "bytes", "format", "add", "convert", "sign", "encrypt", "decrypt",
    "digest", "compare", "protect", "loop", "path", "playing", "position", "pause",
    "name", "duration", "error", "preload", "version", "meta."
}


def sanitize_snippet(text):
    text = re.sub(r'[A-Za-z]:\\Users\\[^\\"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/Users/[^/"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:\\project\\rust\\nanai-android-mascot\\?', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/project/rust/nanai-android-mascot/?', '', text, flags=re.IGNORECASE)
    return text


def load_codebase(base_dir="."):
    codebase = []
    # Strict production app code directories (excluding cpp and test directories)
    search_dirs = [
        os.path.join(base_dir, 'src-tauri'),
        os.path.join(base_dir, 'crates'),
        os.path.join(base_dir, 'ui')
    ]
    ignore_dirs = {
        'target', 'build', '.gradle', '.cxx', 'node_modules', 'dist', 'gen',
        'coverage', 'docs', 'tests', 'test', '.git', '.jules'
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


def parse_keywords(keyword_str):
    """Splits a keyword string by comma, slash, or pipe into distinct search terms."""
    if not keyword_str:
        return []
    # If the string contains literal escaped newline (e.g. from markdown linebreaks), take first line
    if r'\n' in keyword_str:
        keyword_str = keyword_str.split(r'\n')[0]
    # Split by comma or pipe (e.g. 'OnMouseDown, OnMouseDownEx' or 'foo | bar')
    parts = re.split(r'[,|]', keyword_str)
    terms = []
    for p in parts:
        term = p.strip()
        if term and term.lower() not in GENERIC_KEYWORDS:
            terms.append(term)
    return terms


def build_wildcard_regex(term):
    """Builds a compiled regular expression for wildcard search terms containing '*'.

    Escaped asterisks (e.g. `\\*` as in `%\\*`) are treated as literal asterisks, not wildcards.
    """
    if '*' not in term or term == '*' or r'\*' in term:
        return None
    parts = term.split('*')
    escaped_parts = [re.escape(p) for p in parts]
    # Match any alphanumeric, underscore, hyphen or period between wildcard parts
    pattern = r'[a-zA-Z0-9_\-]+'.join(escaped_parts)
    return re.compile(pattern, re.IGNORECASE)


def search_keyword(keyword, codebase, cache=None, stats=None):
    """Searches for occurrences of keyword terms in the codebase.

    Supports wildcard patterns (e.g. `*.refresh`, `char*.name`),
    optional caching (cache dict), and performance stats tracking.
    """
    terms = parse_keywords(keyword)
    if not terms:
        return []

    # If codebase is tuple format (path, lines) convert/cache full_text if available
    # Prepare list of (path, lines, full_text)
    file_records = []
    for item in codebase:
        if len(item) == 3:
            file_records.append(item)
        else:
            path, lines = item
            file_records.append((path, lines, "".join(lines)))

    results = []
    seen = set()

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
            wildcard_regex = build_wildcard_regex(term)

            for path, lines, full_text in file_records:
                # Avoid matching an audit file or test file against itself
                if 'docs/' in path or 'tests/' in path:
                    continue

                if wildcard_regex is not None:
                    # Fast pre-check: test against full text first if possible
                    if not wildcard_regex.search(full_text):
                        continue
                    for idx, line in enumerate(lines, 1):
                        if wildcard_regex.search(line):
                            cleaned_line = sanitize_snippet(line.strip())
                            term_matches.append((path, idx, cleaned_line))
                            if len(term_matches) >= 10:
                                break
                else:
                    # Fast pre-check: skip line-by-line scan if term is not in file at all
                    if term not in full_text:
                        continue
                    for idx, line in enumerate(lines, 1):
                        if term in line:
                            cleaned_line = sanitize_snippet(line.strip())
                            term_matches.append((path, idx, cleaned_line))
                            if len(term_matches) >= 10:
                                break
                if len(term_matches) >= 10:
                    break
            if cache is not None:
                cache[term] = term_matches

        for path, idx, cleaned_line in term_matches:
            loc = (path, idx)
            if loc not in seen:
                seen.add(loc)
                results.append((path, idx, cleaned_line))
                if len(results) >= 10:
                    break
        if len(results) >= 10:
            break

    return results


class ComplianceReport:
    """Represents a compliance audit report with serialization support and regression tracking."""

    def __init__(self, category_stats, updated_files=None, total_files=0, regressions=None, generated_at=None, perf_stats=None):
        self.category_stats = category_stats
        self.updated_files = updated_files or []
        self.total_files = total_files
        self.regressions = regressions or []
        self.perf_stats = perf_stats or {}
        self.generated_at = generated_at or datetime.datetime.now(datetime.timezone.utc).isoformat()

        tot_ok = sum(st["✅"] for st in category_stats.values())
        tot_partial = sum(st["⚠️"] for st in category_stats.values())
        tot_ng = sum(st["❌"] for st in category_stats.values())
        tot_unk = sum(st["❓"] for st in category_stats.values())
        tot_all = sum(st["合計"] for st in category_stats.values())

        self.totals = {
            "✅": tot_ok,
            "⚠️": tot_partial,
            "❌": tot_ng,
            "❓": tot_unk,
            "合計": tot_all,
            "compliance_rate_percent": round((tot_ok / tot_all * 100), 2) if tot_all > 0 else 0.0
        }

    def to_dict(self):
        categories_dict = {}
        for cat in sorted(self.category_stats.keys()):
            st = self.category_stats[cat]
            total = st["合計"]
            ok = st["✅"]
            rate = round((ok / total * 100), 2) if total > 0 else 0.0
            categories_dict[cat] = {
                "implemented": ok,
                "partial": st["⚠️"],
                "missing": st["❌"],
                "unverified": st["❓"],
                "total": total,
                "compliance_rate_percent": rate
            }

        data = {
            "generated_at": self.generated_at,
            "total_files_audited": self.total_files,
            "updated_files_count": len(self.updated_files),
            "regressions_count": len(self.regressions),
            "regressions": self.regressions,
            "summary": {
                "implemented": self.totals["✅"],
                "partial": self.totals["⚠️"],
                "missing": self.totals["❌"],
                "unverified": self.totals["❓"],
                "total": self.totals["合計"],
                "compliance_rate_percent": self.totals["compliance_rate_percent"]
            },
            "categories": categories_dict
        }
        if self.perf_stats:
            data["perf_stats"] = self.perf_stats
        return data

    def to_json(self, indent=2):
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)

    def to_markdown(self):
        lines = [
            "# UKADOC 仕様適合監査レポート (Compliance Report)",
            "",
            f"- **生成日時**: {self.generated_at}",
            f"- **監査対象総数**: {self.totals['合計']}",
            f"- **全体適合率**: {self.totals['compliance_rate_percent']}%",
            f"- **リグレッション検知数**: {len(self.regressions)}",
        ]
        if self.perf_stats:
            elapsed = self.perf_stats.get("elapsed_seconds", 0.0)
            hits = self.perf_stats.get("cache_hits", 0)
            misses = self.perf_stats.get("cache_misses", 0)
            terms = self.perf_stats.get("unique_terms", 0)
            lines.extend([
                f"- **監査所要時間**: {elapsed:.2f}s",
                f"- **キャッシュ統計**: 固有検索語 {terms}件, ヒット {hits}回, ミス {misses}回",
            ])
        lines.extend([
            "",
            "## 規格別集計",
            "",
            "| 規格 (カテゴリ) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 適合率 | 合計 |",
            "| :--- | --------: | ----------: | --------: | --------: | -----: | ---: |"
        ])

        for cat in sorted(self.category_stats.keys()):
            st = self.category_stats[cat]
            ok, partial, ng, unk, total = st["✅"], st["⚠️"], st["❌"], st["❓"], st["合計"]
            rate = round((ok / total * 100), 1) if total > 0 else 0.0
            lines.append(f"| {cat:<36} | {ok:9d} | {partial:11d} | {ng:9d} | {unk:9d} | {rate:5.1f}% | {total:4d} |")

        tot = self.totals
        lines.append(
            f"| **合計** | {tot['✅']:9d} | {tot['⚠️']:11d} | {tot['❌']:9d} | {tot['❓']:9d} | {tot['compliance_rate_percent']:5.1f}% | {tot['合計']:4d} |"
        )

        if self.regressions:
            lines.extend([
                "",
                "## ⚠️ リグレッション (未達へ後退した項目)",
                "",
                "| ファイルパス | 検索語 | 以前のステータス | 現在のステータス |",
                "| :--- | :--- | :--- | :--- |"
            ])
            for reg in self.regressions:
                lines.append(f"| `{reg['path']}` | `{reg['keyword']}` | {reg['previous_status']} | {reg['new_status']} |")

        lines.extend([
            "",
            "## 凡例",
            "- ✅ 実装済: コードベース内に該当キーワードまたはハンドラが実装されている項目",
            "- ⚠️ 一部対応: 定義・読込など部分的な対応が確認されている項目",
            "- ❌ 未実装: 実装が未検出の項目",
            "- ❓ 未確認: 手動検証待ちの項目",
            ""
        ])
        return "\n".join(lines)


def process_audit_files(codebase, docs_dir='docs/spec', dry_run=False, target_category=None, use_cache=True):
    start_time = datetime.datetime.now(datetime.timezone.utc)
    patterns = [
        os.path.join(docs_dir, 'ukadoc-spec/**/*.md'),
        os.path.join(docs_dir, 'ukadoc-ssp/**/*.md'),
        os.path.join(docs_dir, 'ssp-external-spec/**/*.md'),
        os.path.join(docs_dir, 'nam-spec/**/*.md')
    ]
    audit_files = []
    for p in patterns:
        audit_files.extend(glob.glob(p, recursive=True))

    audit_files = [
        f.replace('\\', '/') for f in audit_files
        if not f.endswith('README.md') and not f.endswith('SUMMARY.md') and not f.endswith('INDEX.md')
    ]

    updated_files = []
    regressions = []
    category_stats = {}

    # Pre-index codebase lines and full_text for fast pre-checks
    prepped_codebase = []
    for item in codebase:
        if len(item) == 3:
            prepped_codebase.append(item)
        else:
            path, lines = item
            prepped_codebase.append((path, lines, "".join(lines)))

    term_cache = {} if use_cache else None
    perf_stats = {
        "cache_hits": 0,
        "cache_misses": 0,
        "unique_terms": 0,
    }

    for filepath in audit_files:
        # Determine category from relative path under docs_dir
        norm_filepath = filepath.replace('\\', '/')
        norm_docs_dir = docs_dir.replace('\\', '/').rstrip('/') + '/'
        rel_path = norm_filepath.replace(norm_docs_dir, '')
        parts = rel_path.split('/')
        if len(parts) >= 2 and not parts[1].endswith('.md'):
            cat = f"{parts[0]}/{parts[1]}"
        else:
            cat = parts[0]

        if target_category:
            norm_target = target_category.replace('\\', '/').strip('/')
            matches_cat = (
                cat == norm_target or
                cat.startswith(norm_target + '/') or
                norm_target.startswith(cat + '/') and rel_path.startswith(norm_target)
            )
            if not matches_cat:
                continue

        if cat not in category_stats:
            category_stats[cat] = {"✅": 0, "⚠️": 0, "❌": 0, "❓": 0, "合計": 0}

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Handle escaped literal \n in content for robust parsing
        if r'\n' in content:
            normalized_content = content.replace(r'\n', '\n')
        else:
            normalized_content = content

        st_match = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', normalized_content)
        kw_match = re.search(r'-\s*\*\*検索語\*\*:\s*([^\r\n]+)', normalized_content)

        if not st_match:
            continue

        curr_status = st_match.group(1).strip()
        if kw_match:
            keyword = kw_match.group(1).strip()
        else:
            keyword = os.path.splitext(os.path.basename(filepath))[0]

        # Use normalized_content for downstream manipulation if it contained escaped newlines
        if content != normalized_content:
            content = normalized_content

        matches = search_keyword(keyword, prepped_codebase, cache=term_cache, stats=perf_stats)

        is_japanese_prose = bool(re.search(r'[\u3040-\u30ff\u4e00-\u9faf]', keyword))
        is_guide_or_note = (
            'note-' in filepath or 'notes_' in filepath or 'environmentvariable' in filepath
            or '/manual/' in filepath or '/memo/' in filepath or is_japanese_prose
        )

        new_status = curr_status
        if is_guide_or_note:
            # Conceptual guides / documentation pages
            pass
        else:
            if not matches and keyword not in GENERIC_KEYWORDS:
                new_status = "❌ 未実装"
            elif matches and (curr_status.startswith("❌") or curr_status.startswith("⚠️")):
                new_status = "✅ 実装済"

            if matches and keyword not in GENERIC_KEYWORDS:
                impl_lines = []
                for path, line_no, text in matches[:5]:
                    snippet = text[:80]
                    impl_lines.append(f"- `{path}:{line_no}` `{snippet}`")

                impl_block = "\n".join(impl_lines)

                if "## 実装箇所" in content:
                    idx = content.find("## 実装箇所")
                    content = content[:idx] + f"## 実装箇所\n\n{impl_block}\n"
                else:
                    content += f"\n\n## 実装箇所\n\n{impl_block}\n"
            else:
                if "## 実装箇所" in content:
                    idx = content.find("## 実装箇所")
                    content = content[:idx] + f"## 実装箇所\n\n実装コード内に「{keyword}」は検出されませんでした。\n"

        file_changed = False
        if new_status != curr_status:
            # Check for regression: was previously implemented, now missing
            if curr_status.startswith("✅") and new_status.startswith("❌"):
                regressions.append({
                    "path": rel_path,
                    "keyword": keyword,
                    "previous_status": curr_status,
                    "new_status": new_status,
                })
            content = re.sub(r'(-\s*\*\*対応状況\*\*:\s*).*', r'\1' + new_status, content)
            file_changed = True

        content = sanitize_snippet(content)

        if not dry_run and file_changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        if file_changed:
            updated_files.append(filepath)

        if "✅" in new_status:
            category_stats[cat]["✅"] += 1
        elif "⚠️" in new_status:
            category_stats[cat]["⚠️"] += 1
        elif "❓" in new_status or "📝" in new_status:
            category_stats[cat]["❓"] += 1
        else:
            category_stats[cat]["❌"] += 1
        category_stats[cat]["合計"] += 1

    end_time = datetime.datetime.now(datetime.timezone.utc)
    perf_stats["elapsed_seconds"] = round((end_time - start_time).total_seconds(), 3)

    report = ComplianceReport(
        category_stats=category_stats,
        updated_files=updated_files,
        total_files=len(audit_files),
        regressions=regressions,
        perf_stats=perf_stats
    )

    return report


def update_summary(category_stats, summary_path='docs/spec/SUMMARY.md'):
    lines = [
        "# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ",
        "",
        "各項目ファイルの公式仕様に対する実装状況の自動集計結果です。",
        "",
        "| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |",
        "| :--- | --------: | ----------: | --------: | --------: | ---: |"
    ]

    tot_ok = tot_partial = tot_ng = tot_unk = tot_all = 0

    for cat in sorted(category_stats.keys()):
        st = category_stats[cat]
        ok, partial, ng, unk, total = st["✅"], st["⚠️"], st["❌"], st["❓"], st["合計"]
        tot_ok += ok
        tot_partial += partial
        tot_ng += ng
        tot_unk += unk
        tot_all += total
        lines.append(f"| {cat:<36} | {ok:9d} | {partial:11d} | {ng:9d} | {unk:9d} | {total:4d} |")

    lines.append(f"| **合計** | {tot_ok:9d} | {tot_partial:11d} | {tot_ng:9d} | {tot_unk:9d} | {tot_all:4d} |")
    lines.extend([
        "",
        "## 注意",
        "",
        "- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。",
        "- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。",
        ""
    ])

    summary_dir = os.path.dirname(summary_path)
    if summary_dir and not os.path.exists(summary_dir):
        os.makedirs(summary_dir, exist_ok=True)

    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))


def detect_git_conflicts(docs_dir='docs/spec'):
    """
    Scans markdown and doc files under docs_dir for unresolved Git merge conflict markers
    (<<<<<<<, , >>>>>>>). Returns a list of dicts with file path, line number, and marker.
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


def sync_category_readmes(docs_dir='docs/spec', dry_run=False, target_category=None):
    """
    Synchronizes or regenerates category-level README.md files from individual *.md files.
    Only updates when content differs to avoid unnecessary file writes and merge conflicts.
    """
    norm_docs_dir = docs_dir.replace('\\', '/').rstrip('/') + '/'
    candidate_dirs = set()

    for root, dirs, files in os.walk(docs_dir):
        has_spec_md = any(f.endswith('.md') and f not in ('README.md', 'SUMMARY.md', 'INDEX.md') for f in files)
        if has_spec_md:
            candidate_dirs.add(root)

    updated_readmes = []

    for cdir in sorted(candidate_dirs):
        norm_cdir = cdir.replace('\\', '/')
        rel_path = norm_cdir.replace(norm_docs_dir, '')
        parts = rel_path.split('/')
        cat = f'{parts[0]}/{parts[1]}' if len(parts) >= 2 and not parts[1].endswith('.md') else parts[0]

        if target_category:
            norm_target = target_category.replace('\\', '/').strip('/')
            matches_target = (
                rel_path == norm_target or
                rel_path.startswith(norm_target + '/') or
                cat == norm_target or
                cat.startswith(norm_target + '/')
            )
            if not matches_target:
                continue

        category_name = rel_path
        md_files = [
            f for f in glob.glob(os.path.join(cdir, '*.md'))
            if not f.endswith('README.md') and not f.endswith('SUMMARY.md') and not f.endswith('INDEX.md')
        ]
        if not md_files:
            continue
        md_files.sort(key=lambda x: os.path.basename(x).lower())

        lines = [
            f'# {category_name} 項目別突合',
            '',
            '実装コードの文字列検索による一次調査です。',
            '',
            '| 項目 | 検索語 | 対応状況 |',
            '| :--- | :----- | :------: |'
        ]

        for mf in md_files:
            basename = os.path.basename(mf)
            name_no_ext = os.path.splitext(basename)[0]
            with open(mf, 'r', encoding='utf-8') as f:
                content = f.read()

            title_m = re.search(r'^#\s*([^\r\n]+)', content)
            item_title = title_m.group(1).strip() if title_m else name_no_ext

            kw_m = re.search(r'-\s*\*\*検索語\*\*:\s*([^\r\n]+)', content)
            keyword = kw_m.group(1).strip() if kw_m else name_no_ext

            st_m = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', content)
            status = st_m.group(1).strip() if st_m else '❓ 未確認'

            lines.append(f'| [{item_title}]({basename}) | {keyword} | {status} |')

        lines.append('')
        new_content = '\n'.join(lines)
        readme_path = os.path.join(cdir, 'README.md')

        existing_content = None
        if os.path.exists(readme_path):
            with open(readme_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()

        if existing_content != new_content:
            if not dry_run:
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            updated_readmes.append(readme_path.replace('\\', '/'))

    return updated_readmes


def parse_args():
    parser = argparse.ArgumentParser(
        description="Verify specification compliance against UKADOC/SSP audit records."
    )
    parser.add_argument(
        "--dry-run", "--check", action="store_true", dest="dry_run",
        help="Check compliance and print statistics without writing changes to markdown files."
    )
    parser.add_argument(
        "--json", dest="json_path", type=str, default=None,
        help="Export compliance report as JSON to the specified path."
    )
    parser.add_argument(
        "--report", dest="report_path", type=str, default=None,
        help="Export compliance markdown report to the specified path."
    )
    parser.add_argument(
        "--summary-only", action="store_true", dest="summary_only",
        help="Print the summary table to stdout only."
    )
    parser.add_argument(
        "--target", dest="target_category", type=str, default=None,
        help="Filter audit to a specific category (e.g. 'ukadoc-spec/descript')."
    )
    parser.add_argument(
        "--summary-file", dest="summary_path", type=str, default="docs/spec/SUMMARY.md",
        help="Path to SUMMARY.md (defaults to docs/spec/SUMMARY.md)."
    )
    parser.add_argument(
        "--docs-dir", dest="docs_dir", type=str, default="docs/spec",
        help="Path to spec docs directory (defaults to docs/spec)."
    )
    parser.add_argument(
        "--sync-readmes", action="store_true", dest="sync_readmes",
        help="Synchronize category README.md files with individual spec file statuses (honors --target and --dry-run)."
    )
    parser.add_argument(
        "--update-summary-only", action="store_true", dest="update_summary_only",
        help="Safely update SUMMARY.md without modifying any individual audit markdown files, preventing parallel Git merge conflicts."
    )
    parser.add_argument(
        "--check-conflicts", action="store_true", dest="check_conflicts",
        help="Scan docs directory for unresolved Git merge conflict markers and exit with error if any are found."
    )
    parser.add_argument(
        "--fail-on-regression", action="store_true", dest="fail_on_regression",
        help="Exit with non-zero status code if any regression (✅ -> ❌) is detected."
    )
    parser.add_argument(
        "--max-regressions", dest="max_regressions", type=int, default=None,
        help="Maximum allowed number of regressions before exiting with non-zero status code."
    )
    parser.add_argument(
        "--format", dest="export_format", choices=["json", "markdown", "summary"], default=None,
        help="Format for output export or stdout (choices: json, markdown, summary)."
    )
    parser.add_argument(
        "--export", dest="export_path", type=str, default=None,
        help="Target file path when exporting with --format (supports .json, .md)."
    )
    parser.add_argument(
        "--min-rate", dest="min_rate", type=float, default=None,
        help="Minimum required compliance rate (percent). Exit with non-zero if below threshold."
    )
    parser.add_argument(
        "--benchmark", action="store_true", dest="benchmark",
        help="Print detailed execution time and search cache performance statistics."
    )
    parser.add_argument(
        "--no-cache", action="store_true", dest="no_cache",
        help="Disable search term caching across audit files."
    )
    return parser.parse_args()


def main():
    args = parse_args()
    total_start = datetime.datetime.now(datetime.timezone.utc)

    # Check for Git merge conflict markers
    if args.check_conflicts:
        conflicts = detect_git_conflicts(docs_dir=args.docs_dir)
        if conflicts:
            print(f"ERROR: Found {len(conflicts)} unresolved Git merge conflict marker(s) in {args.docs_dir}:")
            for c in conflicts:
                print(f"  - {c['file']}:{c['line']} -> {c['marker']}")
            sys.exit(1)
        else:
            print(f"No Git merge conflict markers found in {args.docs_dir}.")
            if not args.dry_run and not args.update_summary_only and not args.sync_readmes and not args.json_path and not args.report_path and not args.export_path and not args.summary_only:
                sys.exit(0)

    if not args.summary_only:
        print("Loading codebase...")
    load_start = datetime.datetime.now(datetime.timezone.utc)
    codebase = load_codebase()
    load_end = datetime.datetime.now(datetime.timezone.utc)
    if not args.summary_only:
        print(f"Loaded {len(codebase)} source files.")

    # When update_summary_only is requested, process_audit_files runs in dry_run mode
    # so individual markdown files are NEVER modified, preventing merge conflicts.
    audit_dry_run = args.dry_run or args.update_summary_only

    if not args.summary_only:
        print("Processing audit files...")
    report = process_audit_files(
        codebase,
        docs_dir=args.docs_dir,
        dry_run=audit_dry_run,
        target_category=args.target_category,
        use_cache=not args.no_cache
    )

    if (not args.dry_run or args.update_summary_only) and not args.target_category:
        if not args.summary_only:
            print("Updating SUMMARY.md...")
        update_summary(report.category_stats, summary_path=args.summary_path)
        if not args.summary_only:
            print("SUMMARY.md updated successfully.")

    if args.sync_readmes:
        if not args.summary_only:
            print("Synchronizing category README.md files...")
        synced_readmes = sync_category_readmes(
            docs_dir=args.docs_dir,
            dry_run=args.dry_run,
            target_category=args.target_category
        )
        if args.dry_run:
            print(f"[Dry-run] Would update {len(synced_readmes)} category README.md files.")
        else:
            print(f"Updated {len(synced_readmes)} category README.md files.")

    # Handle direct --format / --export
    if args.export_format and args.export_path:
        out_dir = os.path.dirname(args.export_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
        with open(args.export_path, 'w', encoding='utf-8') as f:
            if args.export_format == "json":
                f.write(report.to_json())
            elif args.export_format == "markdown":
                f.write(report.to_markdown())
            else:
                f.write(report.to_markdown())
        print(f"Exported {args.export_format} compliance report to {args.export_path}")

    if args.json_path:
        json_dir = os.path.dirname(args.json_path)
        if json_dir and not os.path.exists(json_dir):
            os.makedirs(json_dir, exist_ok=True)
        with open(args.json_path, 'w', encoding='utf-8') as f:
            f.write(report.to_json())
        print(f"JSON compliance report saved to {args.json_path}")

    if args.report_path:
        rep_dir = os.path.dirname(args.report_path)
        if rep_dir and not os.path.exists(rep_dir):
            os.makedirs(rep_dir, exist_ok=True)
        with open(args.report_path, 'w', encoding='utf-8') as f:
            f.write(report.to_markdown())
        print(f"Markdown compliance report saved to {args.report_path}")

    print(f"Audit complete. Processed {report.totals['合計']} items. Implemented: {report.totals['✅']} ({report.totals['compliance_rate_percent']}%)")
    if args.update_summary_only:
        print(f"[Safe-update] SUMMARY.md updated. 0 individual audit markdown files modified (avoiding Git merge conflicts).")
    elif args.dry_run:
        print(f"[Dry-run] Would update {len(report.updated_files)} files.")
    else:
        print(f"Updated {len(report.updated_files)} audit files.")

    total_end = datetime.datetime.now(datetime.timezone.utc)
    if args.benchmark:
        total_sec = round((total_end - total_start).total_seconds(), 3)
        load_sec = round((load_end - load_start).total_seconds(), 3)
        proc_sec = report.perf_stats.get("elapsed_seconds", 0.0)
        hits = report.perf_stats.get("cache_hits", 0)
        misses = report.perf_stats.get("cache_misses", 0)
        terms = report.perf_stats.get("unique_terms", 0)
        hit_ratio = round((hits / (hits + misses) * 100), 1) if (hits + misses) > 0 else 0.0
        print("\n--- Performance Benchmark ---")
        print(f"Total Execution Time: {total_sec:.3f}s (Load: {load_sec:.3f}s, Process: {proc_sec:.3f}s)")
        print(f"Cache Statistics    : {hits} hits, {misses} misses, {terms} unique terms ({hit_ratio}% hit ratio)")
        print("-----------------------------\n")

    if report.regressions:
        print(f"WARNING: {len(report.regressions)} regressions detected!")
        for reg in report.regressions:
            print(f"  - {reg['path']} ({reg['keyword']}): {reg['previous_status']} -> {reg['new_status']}")

    if args.fail_on_regression and report.regressions:
        print(f"Error: Exiting with code 1 due to {len(report.regressions)} detected regressions.")
        sys.exit(1)

    if args.max_regressions is not None and len(report.regressions) > args.max_regressions:
        print(f"Error: Detected {len(report.regressions)} regressions, exceeding allowed limit of {args.max_regressions}.")
        sys.exit(1)

    if args.min_rate is not None and report.totals["compliance_rate_percent"] < args.min_rate:
        print(
            f"Error: Compliance rate {report.totals['compliance_rate_percent']}% is below the required {args.min_rate}%."
        )
        sys.exit(1)


if __name__ == '__main__':
    main()
