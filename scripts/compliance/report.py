"""
scripts/compliance/report.py

ComplianceReport class for representing audit results, statistics,
and serialization (JSON and Markdown).
"""

import datetime
import json
from scripts.compliance.config import KNOWN_LAYERS


class ComplianceReport:
    """Represents a compliance audit report with serialization support and regression tracking."""

    def __init__(self, category_stats, updated_files=None, total_files=0, regressions=None, generated_at=None, perf_stats=None, layer_summary=None, list_audit=None):
        self.category_stats = category_stats
        self.updated_files = updated_files or []
        self.total_files = total_files
        self.regressions = regressions or []
        self.perf_stats = perf_stats or {}
        self.layer_summary = layer_summary
        self.list_audit = list_audit
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
        if self.layer_summary:
            data["layer_summary"] = self.layer_summary
        if self.list_audit:
            data["list_audit"] = self.list_audit
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

        if self.layer_summary:
            by_layer = self.layer_summary.get("by_layer", {})
            lines.extend([
                "",
                "## レイヤー到達度集計 (Layer Reachability Summary)",
                "",
                "| 到達指標 / レイヤー | 件数 |",
                "| :--- | ---: |",
                f"| Core/Backend のみ (`core_only`) | {self.layer_summary.get('core_only', 0):d} |",
                f"| UI 到達済 (`ui_connected`) | {self.layer_summary.get('ui_connected', 0):d} |",
                f"| フルパイプライン (`full_pipeline`) | {self.layer_summary.get('full_pipeline', 0):d} |",
            ])
            for layer in KNOWN_LAYERS:
                lines.append(f"| Layer: `{layer}` | {by_layer.get(layer, 0):d} |")

        if self.list_audit:
            lines.extend([
                "",
                "## 実装対照リスト監査集計 (Comparison Lists Audit Summary)",
                "",
                "| 監査指標 | 件数 |",
                "| :--- | ---: |",
                f"| 検査対象リストファイル総数 (`total_list_files_checked`) | {self.list_audit.get('total_list_files_checked', 0):d} |",
                f"| カテゴリ一覧ファイル数 (`category_list_files_checked`) | {self.list_audit.get('category_list_files_checked', 0):d} |",
                f"| 適合仕様一覧ファイル数 (`compliance_files_checked`) | {self.list_audit.get('compliance_files_checked', 0):d} |",
                f"| 破損テーブル行数 (`corrupted_rows_count`) | {self.list_audit.get('corrupted_rows_count', 0):d} |",
                f"| リンク切れ `.md` 参照数 (`broken_links_count`) | {self.list_audit.get('broken_links_count', 0):d} |",
                f"| リスト未掲載リーフ仕様数 (`unlisted_leaf_specs_count`) | {self.list_audit.get('unlisted_leaf_specs_count', 0):d} |",
                f"| 検証済実装コードパス数 (`referenced_impl_paths_checked`) | {self.list_audit.get('referenced_impl_paths_checked', 0):d} |",
                f"| 欠落実装コードパス数 (`missing_impl_paths_count`) | {self.list_audit.get('missing_impl_paths_count', 0):d} |",
            ])

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
