"""
tests/test_verify_spec_sync.py

Unit tests for SUMMARY.md generation, category README synchronization,
lowercase README spec protection, index classification, and parent README sync.
"""

import os
import shutil
import tempfile
import unittest

from scripts.compliance.summary import update_summary
from scripts.compliance.sync_readmes import sync_category_readmes
from scripts.compliance.audit_helpers import (
    is_spec_item_readme,
    is_category_table_index,
)


class TestVerifySpecSync(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.docs_dir = os.path.join(self.test_dir, 'docs', 'spec')
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'spec'), exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

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

    def test_sync_category_readmes_dry_run_vs_live(self):
        cat_dir = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec')
        spec_file = os.path.join(cat_dir, 'item1.md')
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write("# Item One\n\n- **対応状況**: ✅ 実装済\n- **検索語**: item_one\n")

        updated = sync_category_readmes(docs_dir=self.docs_dir, dry_run=True, target_category='ukadoc-spec/spec')
        self.assertEqual(len(updated), 1)
        readme_path = os.path.join(cat_dir, 'README.md')
        self.assertFalse(os.path.exists(readme_path))

        updated_live = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False, target_category='ukadoc-spec/spec')
        self.assertEqual(len(updated_live), 1)
        self.assertTrue(os.path.exists(readme_path))

        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn("[Item One](item1.md)", content)
        self.assertIn("item_one", content)
        self.assertIn("✅ 実装済", content)

        updated_repeat = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False, target_category='ukadoc-spec/spec')
        self.assertEqual(len(updated_repeat), 0)

        updated_other = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False, target_category='ukadoc-spec/descript')
        self.assertEqual(len(updated_other), 0)

    def test_lowercase_readme_spec_protection_and_index_classification(self):
        descript_txt_dir = os.path.join(self.docs_dir, 'ukadoc-spec', 'descript', 'balloon', 'descript-txt')
        os.makedirs(descript_txt_dir, exist_ok=True)

        readme_spec = os.path.join(descript_txt_dir, 'readme.md')
        original_readme_content = (
            "# readme,ファイル名\n\n"
            "- **検索語**: readme\n"
            "- **対応状況**: ✅ 実装済\n"
        )
        with open(readme_spec, 'w', encoding='utf-8') as f:
            f.write(original_readme_content)

        charset_spec = os.path.join(descript_txt_dir, 'charset.md')
        with open(charset_spec, 'w', encoding='utf-8') as f:
            f.write("# charset,文字コード\n\n- **検索語**: charset_prop\n- **対応状況**: ✅ 実装済\n")

        index_table = os.path.join(descript_txt_dir, 'index.md')
        with open(index_table, 'w', encoding='utf-8') as f:
            f.write(
                "# Descript-txt Index\n\n"
                "| 項目 | 検索語 | 対応状況 |\n"
                "| :--- | :----- | :------: |\n"
                "| [readme,ファイル名](readme.md) | readme | ✅ 実装済 |\n"
                "| [charset,文字コード](charset.md) | charset_prop | ✅ 実装済 |\n"
            )

        self.assertTrue(is_spec_item_readme(readme_spec))
        self.assertTrue(is_category_table_index(index_table))

        updated = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(len(updated), 0)
        with open(readme_spec, 'r', encoding='utf-8') as f:
            self.assertEqual(f.read(), original_readme_content)

    def test_update_summary_only_mode(self):
        cat_dir = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec')
        spec_file = os.path.join(cat_dir, 'sample.md')
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write("# Sample Spec\n\n- **対応状況**: ❌ 未実装\n- **検索語**: custom_fn\n")

        summary_file = os.path.join(self.test_dir, 'SUMMARY.md')
        codebase = [
            ("crates/sample.rs", ["fn custom_fn() {}\n"]),
            ("tests/sample.test.ts", ["custom_fn();\n"]),
        ]

        from scripts.compliance.audit_processor import process_audit_files
        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        self.assertEqual(report.totals["✅"], 1)

        with open(spec_file, 'r', encoding='utf-8') as f:
            content = f.read()
        self.assertIn("❌ 未実装", content)

        update_summary(report.category_stats, summary_path=summary_file)
        self.assertTrue(os.path.exists(summary_file))
        with open(summary_file, 'r', encoding='utf-8') as f:
            summary_content = f.read()
        self.assertIn("ukadoc-spec/spec", summary_content)
        self.assertIn("1", summary_content)

    def test_parent_category_readme_sync(self):
        parent_dir = os.path.join(self.docs_dir, 'ukadoc-spec', 'list', 'shiori-event')
        child_dir = os.path.join(parent_dir, 'boot-close-change')
        os.makedirs(child_dir, exist_ok=True)

        with open(os.path.join(child_dir, 'OnBoot.md'), 'w', encoding='utf-8') as f:
            f.write("# OnBoot\n\n- **検索語**: OnBoot\n- **対応状況**: ✅ 実装済\n")
        with open(os.path.join(child_dir, 'README.md'), 'w', encoding='utf-8') as f:
            f.write(
                "# boot-close-change 項目別突合\n\n"
                "| 項目 | 検索語 | 対応状況 |\n"
                "| :--- | :----- | :------: |\n"
                "| [OnBoot](OnBoot.md) | OnBoot | ✅ 実装済 |\n"
            )

        parent_readme = os.path.join(parent_dir, 'README.md')
        with open(parent_readme, 'w', encoding='utf-8') as f:
            f.write(
                "# shiori-event 項目別突合\n\n"
                "| 項目 | 検索語 | 対応状況 |\n"
                "| :--- | :----- | :------: |\n"
                "| [こ](の.md) | ー | ペ |\n"
                "| [❌](.md) | 出 | 検 |\n"
            )

        updated = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False)
        self.assertIn(parent_readme.replace('\\', '/'), updated)

        with open(parent_readme, 'r', encoding='utf-8') as f:
            fixed_content = f.read()
        self.assertNotIn("[こ](の.md)", fixed_content)
        self.assertNotIn("[❌](.md)", fixed_content)
        self.assertIn("[boot-close-change](boot-close-change/README.md)", fixed_content)

        updated_again = sync_category_readmes(docs_dir=self.docs_dir, dry_run=False)
        self.assertEqual(len(updated_again), 0)


if __name__ == '__main__':
    unittest.main()
