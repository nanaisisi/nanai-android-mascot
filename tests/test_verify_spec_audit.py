"""
tests/test_verify_spec_audit.py

Unit tests for audit file processing, dry-run vs live updates, caching,
escaped newline normalization, and category filtering.
"""

import os
import shutil
import tempfile
import unittest

from scripts.compliance.audit_processor import process_audit_files


class TestVerifySpecAudit(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.docs_dir = os.path.join(self.test_dir, 'docs', 'spec')
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'spec'), exist_ok=True)
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'descript'), exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_process_audit_files_dry_run_vs_live(self):
        spec_file = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'sample.md')
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write(
                "# Sample Spec\n\n"
                "- **対応状況**: ❌ 未実装\n"
                "- **検索語**: custom_spec_function\n\n"
                "## 実装箇所\n\n未実装\n"
            )

        codebase = [("crates/sample.rs", ["fn unrelated() {}\n"])]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["合計"], 1)
        self.assertEqual(report.totals["❌"], 1)
        self.assertEqual(len(report.updated_files), 0)

        prod_only_codebase = [("crates/sample.rs", ["fn custom_spec_function() {}\n"])]
        report_partial = process_audit_files(prod_only_codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report_partial.totals["合計"], 1)
        self.assertEqual(report_partial.totals["⚠️"], 1)

        codebase = [
            ("crates/sample.rs", ["fn custom_spec_function() {}\n"]),
            ("tests/sample.test.ts", ["custom_spec_function();\n"]),
        ]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["合計"], 1)
        self.assertEqual(report.totals["✅"], 1)
        self.assertEqual(len(report.updated_files), 1)

        with open(spec_file, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn("❌ 未実装", content)

        report_live = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(report_live.totals["✅"], 1)
        with open(spec_file, 'r', encoding='utf-8') as f:
            content_live = f.read()
        self.assertIn("✅ 実装済", content_live)
        self.assertIn("custom_spec_function", content_live)

        empty_codebase = [("crates/sample.rs", ["// removed\n"])]
        report_reg = process_audit_files(empty_codebase, docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(report_reg.totals["❌"], 1)
        self.assertEqual(len(report_reg.regressions), 1)
        self.assertEqual(report_reg.regressions[0]["keyword"], "custom_spec_function")
        self.assertIn("✅", report_reg.regressions[0]["previous_status"])
        self.assertIn("❌", report_reg.regressions[0]["new_status"])

    def test_process_audit_files_escaped_newline_normalization(self):
        spec_file = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'escaped_newline.md')
        raw_escaped_content = (
            "# Escaped Spec\\n\\n"
            "- **対応状況**: ❌ 未実装\\n"
            "- **検索語**: escaped_func\\n\\n"
            "## 実装箇所\\n\\n未実装\\n"
        )
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write(raw_escaped_content)

        codebase = [
            ("crates/sample.rs", ["fn escaped_func() {}\n"]),
            ("tests/sample.test.ts", ["escaped_func();\n"]),
        ]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(report.totals["✅"], 1)
        self.assertEqual(len(report.updated_files), 1)

        with open(spec_file, 'r', encoding='utf-8') as f:
            updated_content = f.read()

        self.assertIn("✅ 実装済", updated_content)
        self.assertIn("escaped_func", updated_content)
        self.assertNotIn(r"\n- **対応状況**", updated_content)

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

        codebase = [
            ("crates/sample.rs", ["fn shared_target() {}\n"]),
            ("tests/sample.test.ts", ["shared_target();\n"]),
        ]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True, use_cache=True)
        self.assertEqual(report.totals["✅"], 2)
        self.assertEqual(report.perf_stats["cache_hits"], 1)
        self.assertEqual(report.perf_stats["cache_misses"], 1)
        self.assertEqual(report.perf_stats["unique_terms"], 1)

        report_no_cache = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True, use_cache=False)
        self.assertEqual(report_no_cache.totals["✅"], 2)
        self.assertEqual(report_no_cache.perf_stats["cache_hits"], 0)
        self.assertEqual(report_no_cache.perf_stats["cache_misses"], 2)

    def test_process_audit_files_supplementary_status_and_notes(self):
        spec_note = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'note-test.md')
        with open(spec_note, 'w', encoding='utf-8') as f:
            f.write(
                "# Note Test\n\n"
                "- **対応状況**: 📝 コメントのみ(未実装の可能性大)\n"
                "- **検索語**: custom_note_item\n\n"
            )

        spec_guide = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'japanese_term.md')
        with open(spec_guide, 'w', encoding='utf-8') as f:
            f.write(
                "# Japanese Term Guide\n\n"
                "- **対応状況**: ❓ 未確認\n"
                "- **検索語**: さくらスクリプト解説\n\n"
            )

        codebase = [("crates/sample.rs", ["// no matches\n"])]
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["合計"], 2)
        self.assertEqual(report.totals["❓"], 2)
        self.assertEqual(report.totals["❌"], 0)
        self.assertEqual(report.totals["✅"], 0)


if __name__ == '__main__':
    unittest.main()
