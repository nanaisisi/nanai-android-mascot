#!/usr/bin/env python3
"""
scripts/verify_spec_compliance.py
Verifies specification implementation against audit markdown files.
"""

import datetime
import os
import sys
from pathlib import Path

# Add project root to sys.path when script is run directly
_root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from scripts.compliance.config import KNOWN_LAYERS
from scripts.compliance.loader import load_codebase
from scripts.compliance.audit_processor import process_audit_files
from scripts.compliance.summary import update_summary
from scripts.compliance.sync_readmes import sync_category_readmes
from scripts.compliance.git_safety import detect_git_conflicts, validate_parallel_bulk_safety
from scripts.compliance.cli import parse_args


def main():
    args = parse_args()
    total_start = datetime.datetime.now(datetime.timezone.utc)

    if args.check_conflicts:
        conflicts = detect_git_conflicts(docs_dir=args.docs_dir)
        if conflicts:
            print(f"ERROR: Found {len(conflicts)} unresolved Git merge conflict marker(s) in {args.docs_dir}:")
            for c in conflicts:
                print(f"  - {c['file']}:{c['line']} -> {c['marker']}")
            sys.exit(1)
        else:
            print(f"No Git merge conflict markers found in {args.docs_dir}.")
            if not args.dry_run and not args.update_summary_only and not args.sync_readmes and not args.json_path and not args.report_path and not args.export_path and not args.summary_only:
                sys.exit(0)

    is_safe, safety_msg = validate_parallel_bulk_safety(args)
    if not is_safe:
        print(f"\n{safety_msg}\n")
        sys.exit(1)

    if not args.summary_only:
        print("Loading codebase...")
    load_start = datetime.datetime.now(datetime.timezone.utc)
    codebase = load_codebase(base_dir=args.base_dir)
    load_end = datetime.datetime.now(datetime.timezone.utc)
    if not args.summary_only:
        print(f"Loaded {len(codebase)} source files.")

    audit_dry_run = args.dry_run or args.update_summary_only

    if not args.summary_only:
        print("Processing audit files...")
    report = process_audit_files(
        codebase,
        docs_dir=args.docs_dir,
        dry_run=audit_dry_run,
        target_category=args.target_category,
        use_cache=not args.no_cache,
        compliance_dir=args.compliance_dir,
        base_dir=args.base_dir
    )

    if (not args.dry_run or args.update_summary_only) and not args.target_category:
        if not args.summary_only:
            print("Updating SUMMARY.md...")
        update_summary(report.category_stats, summary_path=args.summary_path)
        if not args.summary_only:
            print("SUMMARY.md updated successfully.")

    if args.sync_readmes:
        if not args.summary_only:
            print("Synchronizing category README.md files...")
        synced_readmes = sync_category_readmes(
            docs_dir=args.docs_dir,
            dry_run=args.dry_run,
            target_category=args.target_category
        )
        if args.dry_run:
            print(f"[Dry-run] Would update {len(synced_readmes)} category README.md files.")
        else:
            print(f"Updated {len(synced_readmes)} category README.md files.")

    if args.export_format and args.export_path:
        out_dir = os.path.dirname(args.export_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
        with open(args.export_path, 'w', encoding='utf-8') as f:
            if args.export_format in ("json", "markdown"):
                f.write(report.to_json() if args.export_format == "json" else report.to_markdown())
            else:
                f.write(report.to_markdown())
        print(f"Exported {args.export_format} compliance report to {args.export_path}")

    if args.json_path:
        json_dir = os.path.dirname(args.json_path)
        if json_dir and not os.path.exists(json_dir):
            os.makedirs(json_dir, exist_ok=True)
        with open(args.json_path, 'w', encoding='utf-8') as f:
            f.write(report.to_json())
        print(f"JSON compliance report saved to {args.json_path}")

    if args.report_path:
        rep_dir = os.path.dirname(args.report_path)
        if rep_dir and not os.path.exists(rep_dir):
            os.makedirs(rep_dir, exist_ok=True)
        with open(args.report_path, 'w', encoding='utf-8') as f:
            f.write(report.to_markdown())
        print(f"Markdown compliance report saved to {args.report_path}")

    print(f"Audit complete. Processed {report.totals['合計']} items. Implemented: {report.totals['✅']} ({report.totals['compliance_rate_percent']}%)")
    if args.update_summary_only:
        print("[Safe-update] SUMMARY.md updated. 0 individual audit markdown files modified.")
    elif args.dry_run:
        print(f"[Dry-run] Would update {len(report.updated_files)} files.")
    else:
        print(f"Updated {len(report.updated_files)} audit files.")

    if args.check_layers and report.layer_summary:
        by_layer = report.layer_summary.get("by_layer", {})
        print("\n--- Layer Reachability Summary ---")
        print(f"Core/Backend Only : {report.layer_summary.get('core_only', 0)} items")
        print(f"UI Connected      : {report.layer_summary.get('ui_connected', 0)} items")
        print(f"Full Pipeline     : {report.layer_summary.get('full_pipeline', 0)} items")
        print("By Layer          : " + ", ".join(f"{layer}={by_layer.get(layer, 0)}" for layer in KNOWN_LAYERS))
        tested = by_layer.get("tests", 0)
        total_items = report.total_files or 0
        test_pct = round((tested / total_items) * 100, 2) if total_items else 0.0
        print(f"Test Traceability : {tested}/{total_items} items ({test_pct}%)")

        # Windows / Android プラットフォーム別対応マトリクス集計
        win_only_count = 0
        android_unsupported_count = 0
        for md_path in Path(args.docs_dir).rglob("*.md"):
            try:
                text = md_path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if "Windows" in text and ("専用" in text or "cfg(target_os" in text):
                win_only_count += 1
            if "Android 非対応" in text or "Android非対応" in text:
                android_unsupported_count += 1
        print(f"Platform Matrix   : Windows-only-notes={win_only_count}, Android-unsupported={android_unsupported_count}")

        # docs/ukadoc-spec と docs/ukadoc-ssp との差分検出 (各ターゲット正規化相対パス + カテゴリ別集計)
        for src_name in ("ukadoc-spec", "ukadoc-ssp"):
            src_root = Path("docs", src_name)
            dst_root = Path(args.docs_dir, src_name)
            if not src_root.is_dir() or not dst_root.is_dir():
                continue
            spec_rel_keys = set()
            for p in dst_root.rglob("*.md"):
                rel = p.relative_to(dst_root).with_suffix("").as_posix().lower()
                spec_rel_keys.add(rel)
                if rel.endswith("/index") or rel.endswith("/readme"):
                    spec_rel_keys.add(rel.rsplit("/", 1)[0])
                if "-" in p.stem:
                    parent_rel = p.parent.relative_to(dst_root).as_posix().lower()
                    prefix = p.stem.split("-", 1)[0].lower()
                    spec_rel_keys.add(
                        f"{parent_rel}/{prefix}" if parent_rel != "." else prefix
                    )

            src_pages = [
                p for p in src_root.rglob("*")
                if p.is_file()
                and p.suffix.lower() in {".html", ".htm", ".md"}
                and p.stem.lower() not in {"index", "readme", "claude"}
                and ".note" not in p.stem.lower()
                and not {"about", "i18n", "oldstyle"} & {part.lower() for part in p.relative_to(src_root).parts}
            ]
            missing_by_cat = {}
            for p in src_pages:
                rel = p.relative_to(src_root).with_suffix("").as_posix().lower()
                if p.stem.lower() == "chapter0":
                    parent_rel = p.parent.relative_to(src_root).as_posix().lower()
                    if parent_rel in spec_rel_keys:
                        continue
                if rel not in spec_rel_keys and f"{rel}/index" not in spec_rel_keys:
                    cat = rel.split("/")[0] if "/" in rel else "(root)"
                    missing_by_cat.setdefault(cat, []).append(p.relative_to(src_root).as_posix())
            total_missing = sum(len(v) for v in missing_by_cat.values())
            print(f"{src_name} Diff : {total_missing} uncreated spec(s) (source: {src_root})")
            for cat in sorted(missing_by_cat):
                items = missing_by_cat[cat]
                print(f"  [{cat}] {len(items)} missing:")
                for item in items:
                    print(f"    - {item}")

            # 分割ディレクトリ内の見出しレベル差分検出 (## / ### vs 小ファイル # タイトル)
            heading_diffs = []
            for p in src_pages:
                rel_no_ext = p.relative_to(src_root).with_suffix("")
                split_dir = dst_root / rel_no_ext
                if not split_dir.is_dir():
                    continue
                src_headings = []
                for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
                    if line.startswith("## ") or line.startswith("### "):
                        h = line.lstrip("# ").strip()
                        if h and h not in {"一覧", "補足"}:
                            src_headings.append(h)
                if not src_headings:
                    continue
                dst_titles = set()
                for sp in split_dir.glob("*.md"):
                    if sp.name.lower() in {"readme.md", "index.md"}:
                        continue
                    for line in sp.read_text(encoding="utf-8", errors="ignore").splitlines():
                        if line.startswith("# "):
                            dst_titles.add(line[2:].strip().lower())
                            break
                missing_h = [h for h in src_headings if not any(h.lower() in dt for dt in dst_titles)]
                if missing_h and len(list(split_dir.glob("*.md"))) > 1:
                    heading_diffs.append((rel_no_ext.as_posix(), missing_h))
            if heading_diffs:
                print(f"{src_name} Heading Diff : {len(heading_diffs)} split dir(s) with unmapped headings")
                for rel_dir, mh in heading_diffs[:10]:
                    print(f"  [{rel_dir}] {len(mh)} unmapped (e.g. {', '.join(mh[:3])})")
        print("----------------------------------\n")

    if (args.check_lists or args.check_layers) and report.list_audit:
        la = report.list_audit
        print("\n--- Comparison Lists Audit Summary ---")
        print(f"List Files Checked     : {la.get('total_list_files_checked', 0)}")
        print(f"Corrupted Table Rows   : {la.get('corrupted_rows_count', 0)}")
        print(f"Broken .md Links       : {la.get('broken_links_count', 0)}")
        print(f"Unlisted Leaf Specs    : {la.get('unlisted_leaf_specs_count', 0)}")
        print(f"Impl Paths Verified    : {la.get('referenced_impl_paths_checked', 0)} (Missing: {la.get('missing_impl_paths_count', 0)})")
        if args.check_lists:
            for cr in la.get("corrupted_rows", []):
                print(f"  [Corrupted Row] {cr['file']}:{cr['line']} -> {cr['row']}")
            for bl in la.get("broken_links", []):
                print(f"  [Broken Link] {bl['file']}:{bl['line']} -> {bl['target']}")
            for ul in la.get("unlisted_leaf_specs", []):
                print(f"  [Unlisted Leaf] {ul}")
                stem = Path(ul).stem
                print(f"    [Scaffold] | [{stem}]({Path(ul).name}) | {stem} | ❌ 未実装 |")
            for mp in la.get("missing_impl_paths", []):
                print(f"  [Missing Impl Path] {mp['file']} -> {mp['path']}")
        print("--------------------------------------\n")

    total_end = datetime.datetime.now(datetime.timezone.utc)
    if args.benchmark:
        total_sec = round((total_end - total_start).total_seconds(), 3)
        load_sec = round((load_end - load_start).total_seconds(), 3)
        proc_sec = report.perf_stats.get("elapsed_seconds", 0.0)
        hits = report.perf_stats.get("cache_hits", 0)
        misses = report.perf_stats.get("cache_misses", 0)
        print("\n--- Performance Benchmark ---")
        print(f"Total Execution Time: {total_sec:.3f}s (Load: {load_sec:.3f}s, Process: {proc_sec:.3f}s)")
        print(f"Cache Statistics    : {hits} hits, {misses} misses")
        print("-----------------------------\n")

    if report.regressions:
        print(f"WARNING: {len(report.regressions)} regressions detected!")
        for reg in report.regressions:
            print(f"  - {reg['path']} ({reg['keyword']}): {reg['previous_status']} -> {reg['new_status']}")

    if args.fail_on_regression and report.regressions:
        sys.exit(1)
    if args.max_regressions is not None and len(report.regressions) > args.max_regressions:
        sys.exit(1)
    if args.min_rate is not None and report.totals["compliance_rate_percent"] < args.min_rate:
        sys.exit(1)


if __name__ == "__main__":
    main()
