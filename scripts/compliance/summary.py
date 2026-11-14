"""
scripts/compliance/summary.py

SUMMARY.md updates.
"""

import os


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
