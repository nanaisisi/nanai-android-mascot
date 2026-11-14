"""
tests/test_verify_spec_lists.py

Unit tests for comparison list verification and check-lists CLI.
"""

import io
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

from scripts.compliance.verify import verify_comparison_lists
from scripts.verify_spec_compliance import main as cli_main


class TestVerifySpecLists(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.docs_dir = os.path.join(self.test_dir, 'docs', 'spec')
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'spec'), exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_verify_comparison_lists_and_check_lists_cli(self):
        compliance_dir = os.path.join(self.test_dir, 'docs', 'doc', 'compliance')
        os.makedirs(compliance_dir, exist_ok=True)

        impl_file = os.path.join(self.test_dir, 'crates', 'sample.rs')
        os.makedirs(os.path.dirname(impl_file), exist_ok=True)
        with open(impl_file, 'w', encoding='utf-8') as f:
            f.write("pub fn sample_item() {}\n")

        with open(os.path.join(self.docs_dir, 'SUMMARY.md'), 'w', encoding='utf-8') as f:
            f.write("# Summary\n\n| 規格 | 合計 |\n| :--- | ---: |\n| ukadoc-spec/spec | 2 |\n")
        with open(os.path.join(self.docs_dir, 'ukadoc-and-ssp-master-comparison.md'), 'w', encoding='utf-8') as f:
            f.write(
                "# Master Comparison\n\n"
                "| 分類 | 実装 |\n"
                "| :--- | :--- |\n"
                "| Core | `crates/sample.rs:1` |\n"
            )

        spec_dir = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec')
        with open(os.path.join(spec_dir, 'listed.md'), 'w', encoding='utf-8') as f:
            f.write("# Listed\n\n- **対応状況**: ✅ 実装済\n- **検索語**: sample_item\n")
        with open(os.path.join(spec_dir, 'unlisted.md'), 'w', encoding='utf-8') as f:
            f.write("# Unlisted\n\n- **対応状況**: ❌ 未実装\n- **検索語**: missing_fn\n")

        cat_readme = os.path.join(spec_dir, 'README.md')
        with open(cat_readme, 'w', encoding='utf-8') as f:
            f.write(
                "# spec 項目別突合\n\n"
                "| 項目 | 検索語 | 対応状況 |\n"
                "| :--- | :----- | :------: |\n"
                "| [Listed](listed.md) | sample_item | ✅ 実装済 |\n"
                "| [こ](の.md) | ー | ペ |\n"
                "| [GhostLink](non_existent.md) | ghost | ❌ 未実装 |\n"
            )

        comp_file = os.path.join(compliance_dir, 'sample-compliance.md')
        with open(comp_file, 'w', encoding='utf-8') as f:
            f.write(
                "# Sample Compliance\n\n"
                "- `crates/sample.rs`\n"
                "- `ui/js/obsolete_missing.js`\n"
                "- `tests/*.test.ts`\n"
            )

        audit = verify_comparison_lists(
            docs_dir=self.docs_dir,
            compliance_dir=compliance_dir,
            base_dir=self.test_dir
        )
        self.assertEqual(audit["master_files_checked"], 2)
        self.assertEqual(audit["category_list_files_checked"], 1)
        self.assertEqual(audit["compliance_files_checked"], 1)
        self.assertEqual(audit["total_list_files_checked"], 4)
        self.assertEqual(audit["corrupted_rows_count"], 1)
        self.assertEqual(audit["broken_links_count"], 2)
        self.assertEqual(audit["unlisted_leaf_specs_count"], 1)
        self.assertEqual(audit["referenced_impl_paths_checked"], 3)
        self.assertEqual(audit["missing_impl_paths_count"], 1)

        with open(cat_readme, 'w', encoding='utf-8') as f:
            f.write(
                "# spec 項目別突合\n\n"
                "| 項目 | 検索語 | 対応状況 |\n"
                "| :--- | :----- | :------: |\n"
                "| [Listed](listed.md) | sample_item | ✅ 実装済 |\n"
                "| [Unlisted](unlisted.md) | missing_fn | ❌ 未実装 |\n"
            )
        with open(comp_file, 'w', encoding='utf-8') as f:
            f.write("# Sample Compliance\n\n- `crates/sample.rs`\n")

        clean_audit = verify_comparison_lists(
            docs_dir=self.docs_dir,
            compliance_dir=compliance_dir,
            base_dir=self.test_dir
        )
        self.assertEqual(clean_audit["corrupted_rows_count"], 0)
        self.assertEqual(clean_audit["broken_links_count"], 0)
        self.assertEqual(clean_audit["unlisted_leaf_specs_count"], 0)
        self.assertEqual(clean_audit["missing_impl_paths_count"], 0)

        codebase = [("crates/sample.rs", ["pub fn sample_item() {}\n"])]
        stdout_buf = io.StringIO()
        with mock.patch.object(
            sys, 'argv',
            [
                'verify_spec_compliance.py', '--dry-run', '--check-lists',
                '--docs-dir', self.docs_dir,
                '--compliance-dir', compliance_dir,
                '--base-dir', self.test_dir
            ]
        ):
            with mock.patch('scripts.verify_spec_compliance.load_codebase', return_value=codebase):
                with mock.patch('sys.stdout', stdout_buf):
                    cli_main()
        cli_output = stdout_buf.getvalue()
        self.assertIn("Comparison Lists Audit Summary", cli_output)
        self.assertIn("Corrupted Table Rows   : 0", cli_output)
        self.assertIn("Broken .md Links       : 0", cli_output)
        self.assertIn("Missing: 0", cli_output)


if __name__ == '__main__':
    unittest.main()
