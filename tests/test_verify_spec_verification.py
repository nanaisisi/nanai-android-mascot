"""
tests/test_verify_spec_verification.py

Unit tests for Git conflict detection, parallel branch safety safeguards,
and layer reachability summaries.
"""

import io
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

from scripts.compliance.git_safety import detect_git_conflicts, validate_parallel_bulk_safety
from scripts.compliance.audit_processor import process_audit_files
from scripts.verify_spec_compliance import main as cli_main


class TestVerifySpecVerification(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.docs_dir = os.path.join(self.test_dir, 'docs', 'spec')
        os.makedirs(os.path.join(self.docs_dir, 'ukadoc-spec', 'spec'), exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_detect_git_conflicts(self):
        conflicts = detect_git_conflicts(docs_dir=self.docs_dir)
        self.assertEqual(len(conflicts), 0)

        clean_file = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'clean.md')
        with open(clean_file, 'w', encoding='utf-8') as f:
            f.write("# Clean File\n\nNo conflict here.\n")

        conflicts = detect_git_conflicts(docs_dir=self.docs_dir)
        self.assertEqual(len(conflicts), 0)

        conflict_file = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', 'conflict.md')
        with open(conflict_file, 'w', encoding='utf-8') as f:
            f.write(
                "# Header\n"
                "<<<<<<< HEAD\n"
                "Local branch version\n"
                "=======\n"
                "Incoming branch version\n"
                ">>>>>>> branch-15\n"
            )

        conflicts = detect_git_conflicts(docs_dir=self.docs_dir)
        self.assertEqual(len(conflicts), 3)
        markers = [c["marker"] for c in conflicts]
        self.assertTrue(any("<<<<<<<" in m for m in markers))
        self.assertTrue(any("=======" in m for m in markers))
        self.assertTrue(any(">>>>>>>" in m for m in markers))

    def test_parallel_conflict_safeguards(self):
        class MockArgs:
            dry_run = False
            update_summary_only = False
            summary_only = False
            target_category = None
            allow_bulk_overwrite = False

        args = MockArgs()
        with mock.patch('scripts.compliance.git_safety.is_parallel_branch', return_value=True):
            is_safe, msg = validate_parallel_bulk_safety(args)
            self.assertFalse(is_safe)
            self.assertIn("Safety Guard", msg)

            args.dry_run = True
            is_safe, _ = validate_parallel_bulk_safety(args)
            self.assertTrue(is_safe)
            args.dry_run = False

            args.update_summary_only = True
            is_safe, _ = validate_parallel_bulk_safety(args)
            self.assertTrue(is_safe)
            args.update_summary_only = False

            args.target_category = "ukadoc-spec/descript"
            is_safe, _ = validate_parallel_bulk_safety(args)
            self.assertTrue(is_safe)
            args.target_category = None

            args.allow_bulk_overwrite = True
            is_safe, _ = validate_parallel_bulk_safety(args)
            self.assertTrue(is_safe)

        with mock.patch('scripts.compliance.git_safety.is_parallel_branch', return_value=False):
            args.allow_bulk_overwrite = False
            is_safe, msg = validate_parallel_bulk_safety(args)
            self.assertTrue(is_safe)
            self.assertIn("On main branch", msg)

    def test_layer_summary_and_check_layers_cli(self):
        specs = {
            "core_only.md": "kw_core_only",
            "backend_only.md": "kw_backend_only",
            "core_and_tests.md": "kw_core_tests",
            "ui_connected_only.md": "kw_ui_only",
            "full_pipe_view.md": "kw_full_view",
            "full_pipe_logic.md": "kw_full_logic",
            "view_and_tests.md": "kw_view_tests",
        }
        for filename, kw in specs.items():
            path = os.path.join(self.docs_dir, 'ukadoc-spec', 'spec', filename)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(f"# {filename}\n\n- **対応状況**: ❌ 未実装\n- **検索語**: {kw}\n")

        codebase = [
            ("crates/core.rs", ["kw_core_only();\n", "kw_core_tests();\n", "kw_full_view();\n"]),
            ("src-tauri/back.rs", ["kw_backend_only();\n"]),
            ("ui/ts/core/logic.ts", ["kw_ui_only();\n", "kw_full_logic();\n"]),
            ("ui/ts/ui/view.ts", ["kw_full_view();\n", "kw_view_tests();\n"]),
            ("tests/spec.test.ts", ["kw_core_tests();\n", "kw_full_view();\n", "kw_full_logic();\n", "kw_view_tests();\n"]),
        ]

        report = process_audit_files(codebase, docs_dir=self.docs_dir, dry_run=True)
        ls = report.layer_summary
        self.assertIsNotNone(ls)
        self.assertEqual(ls["core_only"], 2)
        self.assertEqual(ls["ui_connected"], 4)
        self.assertEqual(ls["full_pipeline"], 2)

        stdout_buf = io.StringIO()
        with mock.patch.object(sys, 'argv', ['verify_spec_compliance.py', '--dry-run', '--check-layers', '--docs-dir', self.docs_dir]):
            with mock.patch('scripts.verify_spec_compliance.load_codebase', return_value=codebase):
                with mock.patch('sys.stdout', stdout_buf):
                    cli_main()
        cli_output = stdout_buf.getvalue()
        self.assertIn("Layer Reachability Summary", cli_output)
        self.assertIn("Core/Backend Only : 2 items", cli_output)
        self.assertIn("UI Connected      : 4 items", cli_output)
        self.assertIn("Full Pipeline     : 2 items", cli_output)


if __name__ == '__main__':
    unittest.main()
