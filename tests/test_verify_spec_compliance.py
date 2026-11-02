"""
tests/test_verify_spec_compliance.py

Unit tests for scripts/verify_spec_compliance.py (Slot-13: UKADOC specification compliance audit engine).
"""

import json
import os
import shutil
import tempfile
import unittest

from scripts.verify_spec_compliance import (
    ComplianceReport,
    load_codebase,
    process_audit_files,
    sanitize_snippet,
    search_keyword,
    update_summary,
)


class TestVerifySpecCompliance(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.docs_dir = os.path.join(self.test_dir, 'docs', 'spec')
        self.code_dir = os.path.join(self.test_dir, 'crates')
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'spec'), exist_ok=True)
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'descript'), exist_ok=True)
        os.makedirs(self.code_dir, exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_sanitize_snippet(self):
        raw = r"C:\project\rust\nanai-android-mascot\crates\ui\src\main.rs:123"
        sanitized = sanitize_snippet(raw)
        self.assertNotIn(r"C:\project\rust\nanai-android-mascot", sanitized)

    def test_search_keyword(self):
        codebase = [
            ("src/main.rs", ["fn handle_sstp_1() {}\n", "let x = 1;\n"]),
            ("src/other.rs", ["// comment only\n", "const ALT_FLAG = true;\n"]),
        ]
        results = search_keyword("handle_sstp_1", codebase)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0][0], "src/main.rs")
        self.assertEqual(results[0][1], 1)
        self.assertIn("handle_sstp_1", results[0][2])

        # Multiple keywords with comma / pipe
        multi_results = search_keyword("not_found, ALT_FLAG", codebase)
        self.assertEqual(len(multi_results), 1)
        self.assertEqual(multi_results[0][0], "src/other.rs")
        self.assertIn("ALT_FLAG", multi_results[0][2])

        pipe_results = search_keyword("handle_sstp_1 | non_existent", codebase)
        self.assertEqual(len(pipe_results), 1)
        self.assertEqual(pipe_results[0][0], "src/main.rs")

        # Generic keyword should return empty
        self.assertEqual(search_keyword("format", codebase), [])
        # Empty keyword should return empty
        self.assertEqual(search_keyword("", codebase), [])

    def test_search_keyword_caching_and_stats(self):
        codebase = [
            ("src/main.rs", ["fn cached_func() {}\n"]),
            ("src/other.rs", ["// comment\n"]),
        ]
        cache = {}
        stats = {"cache_hits": 0, "cache_misses": 0, "unique_terms": 0}

        # First call: cache miss
        res1 = search_keyword("cached_func", codebase, cache=cache, stats=stats)
        self.assertEqual(len(res1), 1)
        self.assertEqual(stats["cache_hits"], 0)
        self.assertEqual(stats["cache_misses"], 1)
        self.assertEqual(stats["unique_terms"], 1)
        self.assertIn("cached_func", cache)

        # Second call: cache hit
        res2 = search_keyword("cached_func", codebase, cache=cache, stats=stats)
        self.assertEqual(res1, res2)
        self.assertEqual(stats["cache_hits"], 1)
        self.assertEqual(stats["cache_misses"], 1)
        self.assertEqual(stats["unique_terms"], 1)

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

        # Totals
        self.assertEqual(report.totals["合計"], 10)
        self.assertEqual(report.totals["✅"], 7)
        self.assertEqual(report.totals["⚠️"], 1)
        self.assertEqual(report.totals["❌"], 2)
        self.assertEqual(report.totals["compliance_rate_percent"], 70.0)
        self.assertEqual(len(report.regressions), 1)

        # JSON
        json_str = report.to_json()
        data = json.loads(json_str)
        self.assertEqual(data["summary"]["implemented"], 7)
        self.assertEqual(data["summary"]["compliance_rate_percent"], 70.0)
        self.assertEqual(data["regressions_count"], 1)
        self.assertIn("ukadoc-spec/spec", data["categories"])
        self.assertIn("perf_stats", data)
        self.assertEqual(data["perf_stats"]["elapsed_seconds"], 1.234)
        self.assertEqual(data["perf_stats"]["cache_hits"], 10)

        # Markdown
        md = report.to_markdown()
        self.assertIn("# UKADOC 仕様適合監査レポート (Compliance Report)", md)
        self.assertIn("ukadoc-spec/spec", md)
        self.assertIn("70.0%", md)
        self.assertIn("- **リグレッション検知数**: 1", md)
        self.assertIn("- **監査所要時間**: 1.23s", md)
        self.assertIn("- **キャッシュ統計**: 固有検索語 5件, ヒット 10回, ミス 5回", md)
        self.assertIn("⚠️ リグレッション (未達へ後退した項目)", md)

    def test_process_audit_files_dry_run_vs_live(self):
        # Create a sample audit file
        spec_file = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'sample.md')
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write(
                "# Sample Spec\n\n"
                "- **対応状況**: ❌ 未実装\n"
                "- **検索語**: custom_spec_function\n\n"
                "## 実装箇所\n\n未実装\n"
            )

        # 1. Without matching codebase
        codebase = [("crates/sample.rs", ["fn unrelated() {}\n"])]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["合計"], 1)
        self.assertEqual(report.totals["❌"], 1)
        self.assertEqual(len(report.updated_files), 0)

        # 2. With matching codebase in dry-run
        codebase = [("crates/sample.rs", ["fn custom_spec_function() {}\n"])]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["合計"], 1)
        self.assertEqual(report.totals["✅"], 1)
        self.assertEqual(len(report.updated_files), 1)

        # Since it was dry-run, the original file should NOT have changed
        with open(spec_file, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn("❌ 未実装", content)

        # 3. With matching codebase in live mode
        report_live = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(report_live.totals["✅"], 1)
        with open(spec_file, 'r', encoding='utf-8') as f:
            content_live = f.read()
        self.assertIn("✅ 実装済", content_live)
        self.assertIn("custom_spec_function", content_live)

        # 4. Regression detection: codebase loses the implementation
        empty_codebase = [("crates/sample.rs", ["// removed\n"])]
        report_reg = process_audit_files(empty_codebase, docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(report_reg.totals["❌"], 1)
        self.assertEqual(len(report_reg.regressions), 1)
        self.assertEqual(report_reg.regressions[0]["keyword"], "custom_spec_function")
        self.assertIn("✅", report_reg.regressions[0]["previous_status"])
        self.assertIn("❌", report_reg.regressions[0]["new_status"])

    def test_target_category_filtering(self):
        spec1 = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 's1.md')
        spec2 = os.path.join(self.docs_dir, 'ukadoc-spec', 'descript', 'd1.md')
        for path in (spec1, spec2):
            with open(path, 'w', encoding='utf-8') as f:
                f.write("# Spec\n\n- **対応状況**: ❌ 未実装\n- **検索語**: none\n")

        codebase = []
        report = process_audit_files(
            codebase,
            docs_dir=self.docs_dir,
            dry_run=True,
            target_category='ukadoc-spec/spec'
        )
        self.assertEqual(report.totals["合計"], 1)
        self.assertIn("ukadoc-spec/spec", report.category_stats)
        self.assertNotIn("ukadoc-spec/descript", report.category_stats)

    def test_process_audit_files_caching(self):
        spec1 = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 's1.md')
        spec2 = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 's2.md')
        for path in (spec1, spec2):
            with open(path, 'w', encoding='utf-8') as f:
                f.write("# Spec\n\n- **対応状況**: ❌ 未実装\n- **検索語**: shared_target\n")

        codebase = [("crates/sample.rs", ["fn shared_target() {}\n"])]
        # When use_cache=True, second file should hit cache
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True, use_cache=True)
        self.assertEqual(report.totals["✅"], 2)
        self.assertEqual(report.perf_stats["cache_hits"], 1)
        self.assertEqual(report.perf_stats["cache_misses"], 1)
        self.assertEqual(report.perf_stats["unique_terms"], 1)

        # When use_cache=False, both calls are misses (0 hits)
        report_no_cache = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True, use_cache=False)
        self.assertEqual(report_no_cache.totals["✅"], 2)
        self.assertEqual(report_no_cache.perf_stats["cache_hits"], 0)
        self.assertEqual(report_no_cache.perf_stats["cache_misses"], 2)

    def test_update_summary(self):
        summary_file = os.path.join(self.test_dir, 'SUMMARY.md')
        category_stats = {
            "ukadoc-spec/spec": {"✅": 1, "⚠️": 0, "❌": 0, "❓": 0, "合計": 1}
        }
        update_summary(category_stats, summary_path=summary_file)
        self.assertTrue(os.path.exists(summary_file))
        with open(summary_file, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn("ukadoc-spec/spec", content)
        self.assertIn("| **合計** |", content)


if __name__ == '__main__':
    unittest.main()
