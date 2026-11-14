"""
tests/test_verify_spec_report.py

Unit tests for ComplianceReport serialization (JSON/Markdown) and CLI export arguments.
"""

import json
import os
import shutil
import tempfile
import unittest

from scripts.compliance.report import ComplianceReport


class TestVerifySpecReport(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_compliance_report_json_and_markdown(self):
        category_stats = {
            "ukadoc-spec/spec": {"✅": 2, "⚠️": 1, "❌": 1, "❓": 0, "合計": 4},
            "ukadoc-spec/descript": {"✅": 5, "⚠️": 0, "❌": 1, "❓": 0, "合計": 6},
        }
        regressions = [{
            "path": "ukadoc-spec/spec/sample.md",
            "keyword": "foo",
            "previous_status": "✅ 実装済",
            "new_status": "❌ 未実装"
        }]
        perf_stats = {
            "elapsed_seconds": 1.234,
            "cache_hits": 10,
            "cache_misses": 5,
            "unique_terms": 5,
        }
        report = ComplianceReport(
            category_stats,
            updated_files=["file1.md"],
            total_files=10,
            regressions=regressions,
            perf_stats=perf_stats
        )

        self.assertEqual(report.totals["合計"], 10)
        self.assertEqual(report.totals["✅"], 7)
        self.assertEqual(report.totals["⚠️"], 1)
        self.assertEqual(report.totals["❌"], 2)
        self.assertEqual(report.totals["compliance_rate_percent"], 70.0)
        self.assertEqual(len(report.regressions), 1)

        json_str = report.to_json()
        data = json.loads(json_str)
        self.assertEqual(data["summary"]["implemented"], 7)
        self.assertEqual(data["summary"]["compliance_rate_percent"], 70.0)
        self.assertEqual(data["regressions_count"], 1)
        self.assertIn("ukadoc-spec/spec", data["categories"])
        self.assertIn("perf_stats", data)
        self.assertEqual(data["perf_stats"]["elapsed_seconds"], 1.234)
        self.assertEqual(data["perf_stats"]["cache_hits"], 10)

        md = report.to_markdown()
        self.assertIn("# UKADOC 仕様適合監査レポート (Compliance Report)", md)
        self.assertIn("ukadoc-spec/spec", md)
        self.assertIn("70.0%", md)
        self.assertIn("- **リグレッション検知数**: 1", md)
        self.assertIn("- **監査所要時間**: 1.23s", md)
        self.assertIn("- **キャッシュ統計**: 固有検索語 5件, ヒット 10回, ミス 5回", md)
        self.assertIn("⚠️ リグレッション (未達へ後退した項目)", md)

    def test_export_and_cli_arguments(self):
        category_stats = {
            "ukadoc-spec/spec": {"✅": 2, "⚠️": 0, "❌": 0, "❓": 0, "合計": 2}
        }
        report = ComplianceReport(category_stats, total_files=2)
        json_export_path = os.path.join(self.test_dir, "export.json")
        md_export_path = os.path.join(self.test_dir, "export.md")

        with open(json_export_path, "w", encoding="utf-8") as f:
            f.write(report.to_json())
        with open(md_export_path, "w", encoding="utf-8") as f:
            f.write(report.to_markdown())

        self.assertTrue(os.path.exists(json_export_path))
        self.assertTrue(os.path.exists(md_export_path))

        with open(json_export_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.assertEqual(data["summary"]["implemented"], 2)

        with open(md_export_path, "r", encoding="utf-8") as f:
            md_text = f.read()
            self.assertIn("# UKADOC 仕様適合監査レポート", md_text)


if __name__ == '__main__':
    unittest.main()
