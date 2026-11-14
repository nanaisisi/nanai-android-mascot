"""
scripts/compliance/cli.py

Command-line argument parsing definition.
"""

import argparse


def parse_args():
    parser = argparse.ArgumentParser(
        description="Verify specification compliance against UKADOC/SSP audit records."
    )
    parser.add_argument(
        "--dry-run", "--check", action="store_true", dest="dry_run",
        help="Check compliance and print statistics without writing changes to markdown files."
    )
    parser.add_argument(
        "--json", dest="json_path", type=str, default=None,
        help="Export compliance report as JSON to the specified path."
    )
    parser.add_argument(
        "--report", dest="report_path", type=str, default=None,
        help="Export compliance markdown report to the specified path."
    )
    parser.add_argument(
        "--summary-only", action="store_true", dest="summary_only",
        help="Print the summary table to stdout only."
    )
    parser.add_argument(
        "--target", dest="target_category", type=str, default=None,
        help="Filter audit to a specific category (e.g. 'ukadoc-spec/descript')."
    )
    parser.add_argument(
        "--summary-file", dest="summary_path", type=str, default="docs/spec/SUMMARY.md",
        help="Path to SUMMARY.md (defaults to docs/spec/SUMMARY.md)."
    )
    parser.add_argument(
        "--docs-dir", dest="docs_dir", type=str, default="docs/spec",
        help="Path to spec docs directory (defaults to docs/spec)."
    )
    parser.add_argument(
        "--compliance-dir", dest="compliance_dir", type=str, default=None,
        help="Path to compliance comparison docs directory (defaults to docs/doc/compliance)."
    )
    parser.add_argument(
        "--base-dir", dest="base_dir", type=str, default=".",
        help="Base repository root directory for implementation path checks (defaults to '.')."
    )
    parser.add_argument(
        "--sync-readmes", action="store_true", dest="sync_readmes",
        help="Synchronize category README.md files with individual spec file statuses (honors --target and --dry-run)."
    )
    parser.add_argument(
        "--update-summary-only", action="store_true", dest="update_summary_only",
        help="Safely update SUMMARY.md without modifying any individual audit markdown files, preventing parallel Git merge conflicts."
    )
    parser.add_argument(
        "--check-conflicts", action="store_true", dest="check_conflicts",
        help="Scan docs directory for unresolved Git merge conflict markers and exit with error if any are found."
    )
    parser.add_argument(
        "--allow-bulk-overwrite", action="store_true", dest="allow_bulk_overwrite",
        help="Explicitly allow modifying all individual audit markdown files even when running on a parallel branch."
    )
    parser.add_argument(
        "--fail-on-regression", action="store_true", dest="fail_on_regression",
        help="Exit with non-zero status code if any regression (✅ -> ❌) is detected."
    )
    parser.add_argument(
        "--max-regressions", dest="max_regressions", type=int, default=None,
        help="Maximum allowed number of regressions before exiting with non-zero status code."
    )
    parser.add_argument(
        "--format", dest="export_format", choices=["json", "markdown", "summary"], default=None,
        help="Format for output export or stdout (choices: json, markdown, summary)."
    )
    parser.add_argument(
        "--export", dest="export_path", type=str, default=None,
        help="Target file path when exporting with --format (supports .json, .md)."
    )
    parser.add_argument(
        "--min-rate", dest="min_rate", type=float, default=None,
        help="Minimum required compliance rate (percent). Exit with non-zero if below threshold."
    )
    parser.add_argument(
        "--benchmark", action="store_true", dest="benchmark",
        help="Print detailed execution time and search cache performance statistics."
    )
    parser.add_argument(
        "--no-cache", action="store_true", dest="no_cache",
        help="Disable search term caching across audit files."
    )
    parser.add_argument(
        "--check-layers", action="store_true", dest="check_layers",
        help="Print layer and UI reachability summary to stdout."
    )
    parser.add_argument(
        "--check-lists", action="store_true", dest="check_lists",
        help="Verify implementation comparison file lists, category tables, and referenced code paths."
    )
    return parser.parse_args()
