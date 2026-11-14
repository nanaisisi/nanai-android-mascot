"""
tests/test_verify_spec_search.py

Unit tests for codebase search, loader classification, and snippet sanitization.
"""

import os
import shutil
import tempfile
import unittest

from scripts.compliance.loader import classify_layer, sanitize_snippet
from scripts.compliance.search import search_keyword, select_representative_matches


class TestVerifySpecSearch(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

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

        multi_results = search_keyword("not_found, ALT_FLAG", codebase)
        self.assertEqual(len(multi_results), 1)
        self.assertEqual(multi_results[0][0], "src/other.rs")
        self.assertIn("ALT_FLAG", multi_results[0][2])

        pipe_results = search_keyword("handle_sstp_1 | non_existent", codebase)
        self.assertEqual(len(pipe_results), 1)
        self.assertEqual(pipe_results[0][0], "src/main.rs")

        self.assertEqual(search_keyword("format", codebase), [])
        self.assertEqual(search_keyword("", codebase), [])

    def test_search_keyword_wildcard(self):
        codebase = [
            ("src/install.rs", ["let key = \"balloon.refresh\";\n", "let dir = \"balloon.directory\";\n"]),
            ("src/script.rs", ["let esc = r\"%\\* %*\";\n", "let non_wildcard = \"%abc\";\n"]),
        ]
        results_refresh = search_keyword("*.refresh", codebase)
        self.assertEqual(len(results_refresh), 1)
        self.assertEqual(results_refresh[0][0], "src/install.rs")
        self.assertIn("balloon.refresh", results_refresh[0][2])

        results_dir = search_keyword("*.directory", codebase)
        self.assertEqual(len(results_dir), 1)
        self.assertEqual(results_dir[0][0], "src/install.rs")
        self.assertIn("balloon.directory", results_dir[0][2])

        results_nomatch = search_keyword("*.unknown_prefix", codebase)
        self.assertEqual(len(results_nomatch), 0)

        results_escaped = search_keyword(r"%\*", codebase)
        self.assertEqual(len(results_escaped), 1)
        self.assertIn("%*", results_escaped[0][2])

    def test_search_keyword_caching_and_stats(self):
        codebase = [
            ("src/main.rs", ["fn cached_func() {}\n"]),
            ("src/other.rs", ["// comment\n"]),
        ]
        cache = {}
        stats = {"cache_hits": 0, "cache_misses": 0, "unique_terms": 0}

        res1 = search_keyword("cached_func", codebase, cache=cache, stats=stats)
        self.assertEqual(len(res1), 1)
        self.assertEqual(stats["cache_hits"], 0)
        self.assertEqual(stats["cache_misses"], 1)
        self.assertEqual(stats["unique_terms"], 1)
        self.assertIn("cached_func", cache)

        res2 = search_keyword("cached_func", codebase, cache=cache, stats=stats)
        self.assertEqual(res1, res2)
        self.assertEqual(stats["cache_hits"], 1)
        self.assertEqual(stats["cache_misses"], 1)
        self.assertEqual(stats["unique_terms"], 1)

    def test_classify_layer(self):
        self.assertEqual(classify_layer("crates/nanai-core/src/lib.rs"), "core")
        self.assertEqual(classify_layer("src-tauri/src/main.rs"), "backend")
        self.assertEqual(classify_layer("ui/ts/ui/modal.ts"), "ui_view")
        self.assertEqual(classify_layer("ui/windows/multi-window.html"), "ui_view")
        self.assertEqual(classify_layer("ui/css/balloon-window.css"), "ui_view")
        self.assertEqual(classify_layer("ui/index.html"), "ui_view")
        self.assertEqual(classify_layer("ui/styles.css"), "ui_view")
        self.assertEqual(classify_layer("ui/test-menu.html"), "ui_view")
        self.assertEqual(classify_layer("ui/ts/core/app-actions.ts"), "ui_logic")
        self.assertEqual(classify_layer("ui/ts/ghost/shiori-notify.ts"), "ui_logic")
        self.assertEqual(classify_layer("ui/ts/surface/character.ts"), "ui_logic")
        self.assertEqual(classify_layer("ui/main.ts"), "ui_logic")
        self.assertEqual(classify_layer("ui/bindings.ts"), "ui_logic")
        self.assertEqual(classify_layer("tests/modal.test.ts"), "tests")
        self.assertEqual(classify_layer("src/main.rs"), "other")
        self.assertEqual(classify_layer(r"crates\nanai-core\src\balloon.rs"), "core")
        self.assertEqual(classify_layer("./ui/test-menu.html"), "ui_view")

    def test_search_keyword_balanced_multilayer_and_representative_locations(self):
        crates_lines = [f"let v{i} = \"font.name\";\n" for i in range(12)]
        backend_lines = [f"let b{i} = \"font.name\";\n" for i in range(7)]
        ui_logic_lines = [f"const u{i} = props[\"font.name\"];\n" for i in range(6)]
        ui_view_lines = ["/* font.name view style */\n", ".balloon { /* font.name */ }\n"]
        test_lines = [f"expect(\"font.name\").toBeTruthy(); // {i}\n" for i in range(6)]

        codebase = [
            ("crates/nanai-core/src/descript_parser.rs", crates_lines),
            ("src-tauri/src/theme.rs", backend_lines),
            ("ui/ts/core/actions/balloon-descript/font/base.ts", ui_logic_lines),
            ("ui/css/balloon-window.css", ui_view_lines),
            ("tests/core-actions.test.ts", test_lines),
        ]

        matches = search_keyword("font.name", codebase)
        layers = [classify_layer(m[0]) for m in matches]
        self.assertEqual(layers.count("core"), 5)
        self.assertEqual(layers.count("backend"), 5)
        self.assertEqual(layers.count("ui_logic"), 5)
        self.assertEqual(layers.count("ui_view"), 2)
        self.assertEqual(layers.count("tests"), 5)
        self.assertEqual(len(matches), 22)

        multi_codebase = [
            ("crates/a.rs", [f"fn first_kw_{i}() {{ first_kw(); }}\n" for i in range(6)]),
            ("src-tauri/b.rs", [f"fn first_kw_b_{i}() {{ first_kw(); }}\n" for i in range(6)]),
            ("ui/ts/core/c.ts", ["second_kw();\n"]),
            ("tests/d.test.ts", ["second_kw();\n"]),
        ]
        multi_matches = search_keyword("first_kw, second_kw", multi_codebase)
        multi_layers = {classify_layer(m[0]) for m in multi_matches}
        self.assertEqual(multi_layers, {"core", "backend", "ui_logic", "tests"})

        reps = select_representative_matches(matches, max_lines=6)
        self.assertEqual(len(reps), 6)
        rep_layers = {classify_layer(m[0]) for m in reps}
        self.assertEqual(rep_layers, {"core", "backend", "ui_logic", "ui_view", "tests"})


if __name__ == '__main__':
    unittest.main()
