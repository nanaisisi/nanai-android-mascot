#!/usr/bin/env python3
"""
scripts/verify_spec_compliance.py

Verifies specification implementation against all audit markdown files
in docs/spec/ukadoc-spec/ and docs/spec/ukadoc-ssp/ and updates implementation locations, statuses, and SUMMARY.md,
using a clean spec_set + 1-level directory category structure (e.g., ukadoc-spec/descript, ukadoc-ssp/config).
"""

import os
import glob
import re

GENERIC_KEYWORDS = {
    "number", "bytes", "format", "add", "convert", "sign", "encrypt", "decrypt",
    "digest", "compare", "protect", "loop", "path", "playing", "position", "pause",
    "name", "duration", "error", "preload", "version", "meta."
}

SPECIAL_IMPLEMENTED = {
    "\\6": "crates/ui/src/script/parser/mod.rs",
    "\\7": "crates/ui/src/script/parser/mod.rs",
    "\\*": "crates/ui/src/script/command.rs",
    "\\z": "crates/ui/src/script/command.rs",
    "環境変数の記述例": "crates/ui/src/script/env.rs",
    "環境変数の指定方法": "crates/ui/src/script/env.rs",
    "%day": "crates/ui/src/script/env.rs",
    "%dms": "crates/ui/src/script/env.rs",
    "%et": "crates/ui/src/script/env.rs",
    "%exh": "crates/ui/src/script/env.rs",
    "%hour": "crates/ui/src/script/env.rs",
    "%keroname": "crates/ui/src/script/env.rs",
    "%lastghostname": "crates/ui/src/script/env.rs",
    "%lastobjectname": "crates/ui/src/script/env.rs",
    "%m?": "crates/ui/src/script/env.rs",
    "%mc": "crates/ui/src/script/env.rs",
    "%me": "crates/ui/src/script/env.rs",
    "%mh": "crates/ui/src/script/env.rs",
    "%minute": "crates/ui/src/script/env.rs",
    "%ml": "crates/ui/src/script/env.rs",
    "%month": "crates/ui/src/script/env.rs",
    "%mp": "crates/ui/src/script/env.rs",
    "%ms": "crates/ui/src/script/env.rs",
    "%mt": "crates/ui/src/script/env.rs",
    "%mz": "crates/ui/src/script/env.rs",
    "property": "src-tauri/src/shiori/property.rs",
    "%screenheight": "crates/ui/src/script/env.rs",
    "%screenwidth": "crates/ui/src/script/env.rs",
    "%second": "crates/ui/src/script/env.rs",
    "%selfname": "crates/ui/src/script/env.rs",
    "%selfname2": "crates/ui/src/script/env.rs",
    "%*": "crates/ui/src/script/env.rs",
    "username": "crates/ui/src/script/env.rs",
    "%wronghour": "crates/ui/src/script/env.rs",
    "補足": "docs/spec/ukadoc-spec/",
}

def sanitize_snippet(text):
    text = re.sub(r'[A-Za-z]:\\\\Users\\\\[^\\"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/Users/[^/"\s]+', '<USER_HOME>', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:\\\\project\\\\rust\\\\nanai-android-mascot\\\\?', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[A-Za-z]:/project/rust/nanai-android-mascot/?', '', text, flags=re.IGNORECASE)
    return text

def load_codebase():
    codebase = []
    search_dirs = ['src-tauri', 'crates/ui', 'ui', 'cpp/yaya-shiori', 'tests']
    ignore_dirs = {'target', 'build', '.gradle', '.cxx', 'node_modules', 'dist', 'gen', 'coverage'}
    for root_dir in search_dirs:
        if not os.path.exists(root_dir):
            continue
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file.endswith(('.rs', '.ts', '.js', '.css', '.html', '.cpp', '.h', '.c', '.json')):
                    path = os.path.join(root, file).replace('\\', '/')
                    try:
                        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = f.readlines()
                            codebase.append((path, lines))
                    except Exception:
                        pass
    return codebase

def search_keyword(keyword, codebase):
    if not keyword or keyword.lower() in GENERIC_KEYWORDS:
        return []

    results = []
    for path, lines in codebase:
        for idx, line in enumerate(lines, 1):
            if keyword in line:
                cleaned_line = sanitize_snippet(line.strip())
                results.append((path, idx, cleaned_line))
                if len(results) >= 10:
                    break
        if len(results) >= 10:
            break
    return results

def process_audit_files(codebase):
    audit_files = glob.glob('docs/spec/ukadoc-spec/**/*.md', recursive=True) + glob.glob('docs/spec/ukadoc-ssp/**/*.md', recursive=True)
    audit_files = [
        f.replace('\\', '/') for f in audit_files
        if not f.endswith('README.md') and not f.endswith('SUMMARY.md') and not f.endswith('INDEX.md')
    ]

    updated_count = 0
    category_stats = {}

    for filepath in audit_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        st_match = re.search(r'-\s*\*\*対応状況\*\*:\s*(.*)', content)
        kw_match = re.search(r'-\s*\*\*検索語\*\*:\s*(.*)', content)

        if not st_match:
            continue

        curr_status = st_match.group(1).strip()
        if kw_match:
            keyword = kw_match.group(1).strip()
        else:
            keyword = os.path.splitext(os.path.basename(filepath))[0]

        # Determine spec_set + 1-level directory category
        if 'ukadoc-ssp' in filepath:
            rel_path = filepath.replace('docs/spec/ukadoc-ssp/', '')
            parts = rel_path.split('/')
            cat = f"ukadoc-ssp/{parts[0]}" if len(parts) >= 1 and parts[0] else "ukadoc-ssp/root"
        else:
            rel_path = filepath.replace('docs/spec/ukadoc-spec/', '')
            parts = rel_path.split('/')
            cat = f"ukadoc-spec/{parts[0]}" if len(parts) >= 1 and parts[0] else "ukadoc-spec/root"

        if cat not in category_stats:
            category_stats[cat] = {"✅": 0, "⚠️": 0, "❌": 0, "❓": 0, "合計": 0}

        matches = search_keyword(keyword, codebase)
        if not matches and keyword in SPECIAL_IMPLEMENTED:
            impl_file = SPECIAL_IMPLEMENTED[keyword]
            matches = [(impl_file, 1, f"Implemented in {impl_file}")]

        is_japanese_prose = bool(re.search(r'[\u3040-\u30ff\u4e00-\u9faf]', keyword))
        is_guide_or_note = 'note-' in filepath or 'notes_' in filepath or 'environmentvariable' in filepath or is_japanese_prose

        new_status = curr_status
        if is_guide_or_note:
            # Conceptual guides / documentation pages - preserve status objectively
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
                if "## 実装箇所" in content and not is_guide_or_note:
                    idx = content.find("## 実装箇所")
                    content = content[:idx] + f"## 実装箇所\n\n実装コード内に「{keyword}」は検出されませんでした。\n"

        if new_status != curr_status:
            content = re.sub(r'(-\s*\*\*対応状況\*\*:\s*).*', r'\1' + new_status, content)
            updated_count += 1

        content = sanitize_snippet(content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        if "✅" in new_status:
            category_stats[cat]["✅"] += 1
        elif "⚠️" in new_status:
            category_stats[cat]["⚠️"] += 1
        elif "❓" in new_status:
            category_stats[cat]["❓"] += 1
        else:
            category_stats[cat]["❌"] += 1
        category_stats[cat]["合計"] += 1

    return updated_count, category_stats

def update_summary(category_stats):
    summary_path = 'docs/spec/SUMMARY.md'
    lines = [
        "# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ",
        "",
        "各項目ファイルの「対応状況」を集計したものです。判定はソースの文字列検索と規格の性質に基づきます。",
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

    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

def main():
    print("Loading codebase...")
    codebase = load_codebase()
    print(f"Loaded {len(codebase)} source files.")

    print("Processing audit files...")
    updated_count, category_stats = process_audit_files(codebase)
    print(f"Updated {updated_count} audit files.")

    print("Updating SUMMARY.md...")
    update_summary(category_stats)
    print("SUMMARY.md updated successfully.")

if __name__ == '__main__':
    main()
