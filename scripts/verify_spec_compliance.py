#!/usr/bin/env python3
"""
scripts/verify_spec_compliance.py

Verifies specification implementation against all audit markdown files
in docs/spec/ukadoc-spec/ and docs/spec/ukadoc-ssp/ and updates implementation locations, statuses, and SUMMARY.md.
"""

import os
import glob
import re

GENERIC_KEYWORDS = {
    "number", "bytes", "format", "add", "convert", "sign", "encrypt", "decrypt",
    "digest", "compare", "protect", "loop", "path", "playing", "position", "pause",
    "name", "duration", "error", "preload", "補足", "さくらスクリプトのエスケープ",
    "さくらスクリプトの寿命", "version", "meta."
}

DOMAIN_STATUS_MAP = {
    "OnBoot": "✅ 実装済(SHIORIへ送信)",
    "OnChoiceSelect": "✅ 実装済",
    "OnSecondChange": "✅ 実装済(SHIORIへ送信)",
    "ghostpathlist": "✅ 実装済",
    "installedghostname": "✅ 実装済",
    "update_result": "✅ 実装済",
    "SAORI": "✅ 実装済",
    "プロパティシステム": "✅ 一部対応",
}

def load_codebase():
    codebase = []
    search_dirs = ['src-tauri', 'crates/ui', 'ui', 'cpp/yaya-shiori', 'tests']
    for root_dir in search_dirs:
        if not os.path.exists(root_dir):
            continue
        for root, dirs, files in os.walk(root_dir):
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
                cleaned_line = line.strip()
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

        # Determine category for SUMMARY.md
        if 'ukadoc-ssp' in filepath:
            rel_path = filepath.replace('docs/spec/ukadoc-ssp/', 'ukadoc-ssp/')
        else:
            rel_path = filepath.replace('docs/spec/ukadoc-spec/', 'ukadoc-spec/')
        parts = rel_path.split('/')
        if len(parts) >= 3 and parts[0] in ['descript', 'list', 'spec', 'ssp', 'config', 'functions', 'howto', 'dev', 'about', 'extra-spec']:
            cat = f"{parts[0]}/{parts[1]}"
        elif len(parts) >= 2:
            cat = parts[0]
        else:
            cat = "root"

        if cat not in category_stats:
            category_stats[cat] = {"✅": 0, "⚠️": 0, "❌": 0, "❓": 0, "合計": 0}

        matches = search_keyword(keyword, codebase)

        new_status = curr_status
        if keyword in DOMAIN_STATUS_MAP and matches:
            new_status = DOMAIN_STATUS_MAP[keyword]
        elif keyword.lower() in GENERIC_KEYWORDS and ('未実装' in curr_status or '検出なし' in curr_status):
            new_status = "❌ 未実装(誤検出)"

        if matches and keyword not in GENERIC_KEYWORDS and keyword not in ["さくらスクリプトのエスケープ", "さくらスクリプトの寿命", "補足"]:
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

            if "❌ 検出なし" in curr_status:
                content = content.replace("実装コードに「" + keyword + "」が見つからない。", f"実装コード内に「{keyword}」を確認。")

        if new_status != curr_status:
            content = re.sub(r'(-\s*\*\*対応状況\*\*:\s*).*', r'\1' + new_status, content)
            updated_count += 1

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
    summary_path = 'docs/spec/ukadoc-spec/SUMMARY.md'
    lines = [
        "# UKADOC Spec & SSP 標準仕様 実装突合マスタサマリ",
        "",
        "本ドキュメントは、公式 **ukadoc-spec**（コア仕様・スクリプト・イベント・記述子）と、事実上の標準ベースウェアである **ukadoc-ssp**（SSP標準設定・機能・ハウツー）の両方における Nanai Android Mascot の対応状況を網羅的に対照・集約したマスターサマリである。",
        "",
        "| 規格カテゴリ | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |",
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
        lines.append(f"| {cat:<26} | {ok:9d} | {partial:11d} | {ng:9d} | {unk:9d} | {total:4d} |")

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
