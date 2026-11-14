"""
scripts/compliance/audit_processor.py

Core audit file processing logic.
"""

import datetime
import glob
import os
import re
from scripts.compliance.config import (
    GENERIC_KEYWORDS,
    KNOWN_LAYERS,
    MAX_IMPL_LOCATIONS,
)
from scripts.compliance.loader import classify_layer, sanitize_snippet
from scripts.compliance.search import (
    init_layer_summary,
    select_representative_matches,
    search_keyword,
)
from scripts.compliance.report import ComplianceReport
from scripts.compliance.verify import verify_comparison_lists
from scripts.compliance.audit_helpers import is_spec_audit_file


def process_audit_files(codebase, docs_dir='docs/spec', dry_run=False, target_category=None, use_cache=True, compliance_dir=None, base_dir='.'):
    start_time = datetime.datetime.now(datetime.timezone.utc)
    patterns = [
        os.path.join(docs_dir, 'ukadoc-spec/**/*.md'),
        os.path.join(docs_dir, 'ukadoc-ssp/**/*.md'),
        os.path.join(docs_dir, 'ssp-external-spec/**/*.md'),
        os.path.join(docs_dir, 'nam-spec/**/*.md')
    ]
    audit_files = []
    for p in patterns:
        audit_files.extend(glob.glob(p, recursive=True))

    audit_files = [
        f.replace('\\', '/') for f in audit_files
        if is_spec_audit_file(f)
    ]

    updated_files = []
    regressions = []
    category_stats = {}
    layer_summary = init_layer_summary()

    prepped_codebase = []
    for item in codebase:
        if len(item) == 3:
            prepped_codebase.append(item)
        else:
            path, lines = item
            prepped_codebase.append((path, lines, "".join(lines)))

    term_cache = {} if use_cache else None
    perf_stats = {
        "cache_hits": 0,
        "cache_misses": 0,
        "unique_terms": 0,
    }

    for filepath in audit_files:
        norm_filepath = filepath.replace('\\', '/')
        norm_docs_dir = docs_dir.replace('\\', '/').rstrip('/') + '/'
        rel_path = norm_filepath.replace(norm_docs_dir, '')
        parts = rel_path.split('/')
        if len(parts) >= 2 and not parts[1].endswith('.md'):
            cat = f"{parts[0]}/{parts[1]}"
        else:
            cat = parts[0]

        if target_category:
            norm_target = target_category.replace('\\', '/').strip('/')
            matches_cat = (
                cat == norm_target or
                cat.startswith(norm_target + '/') or
                norm_target.startswith(cat + '/') and rel_path.startswith(norm_target)
            )
            if not matches_cat:
                continue

        if cat not in category_stats:
            category_stats[cat] = {"✅": 0, "⚠️": 0, "❌": 0, "❓": 0, "合計": 0}

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if r'\n' in content:
            normalized_content = content.replace(r'\n', '\n')
        else:
            normalized_content = content

        st_match = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', normalized_content)
        kw_match = re.search(r'-\s*\*\*検索語\*\*:\s*([^\r\n]+)', normalized_content)

        if not st_match:
            continue

        curr_status = st_match.group(1).strip()
        if kw_match:
            keyword = kw_match.group(1).strip()
        else:
            keyword = os.path.splitext(os.path.basename(filepath))[0]

        if content != normalized_content:
            content = normalized_content

        matches = search_keyword(keyword, prepped_codebase, cache=term_cache, stats=perf_stats)

        item_layers = {classify_layer(m[0]) for m in matches}
        for layer in KNOWN_LAYERS:
            if layer in item_layers:
                layer_summary["by_layer"][layer] += 1
        has_core_or_backend = bool(item_layers & {"core", "backend"})
        has_ui_logic = "ui_logic" in item_layers
        has_ui_view = "ui_view" in item_layers
        has_tests = "tests" in item_layers
        if has_core_or_backend and not (has_ui_logic or has_ui_view or has_tests):
            layer_summary["core_only"] += 1
        if has_ui_logic or has_ui_view:
            layer_summary["ui_connected"] += 1
        if bool(item_layers & {"core", "backend", "ui_logic"}) and bool(item_layers & {"ui_view", "ui_logic"}) and has_tests:
            layer_summary["full_pipeline"] += 1

        is_japanese_prose = bool(re.search(r'[\u3040-\u30ff\u4e00-\u9faf]', keyword))
        is_guide_or_note = (
            'note-' in filepath or 'notes_' in filepath or 'environmentvariable' in filepath
            or '/manual/' in filepath or '/memo/' in filepath or is_japanese_prose
        )

        prod_matches = [m for m in matches if classify_layer(m[0]) != "tests"]
        test_matches = [m for m in matches if classify_layer(m[0]) == "tests"]

        new_status = curr_status
        if is_guide_or_note:
            pass
        elif keyword.lower() in GENERIC_KEYWORDS:
            pass
        else:
            if not matches:
                new_status = "❌ 未実装"
            elif prod_matches and test_matches:
                new_status = "✅ 実装済"
            elif prod_matches or test_matches:
                new_status = "⚠️ 一部対応"
            else:
                new_status = "❌ 未実装"

            if matches and keyword not in GENERIC_KEYWORDS:
                impl_lines = []
                for path, line_no, text in select_representative_matches(matches, max_lines=MAX_IMPL_LOCATIONS):
                    snippet = text[:80]
                    impl_lines.append(f"- `{path}:{line_no}` `{snippet}`")

                impl_block = "\n".join(impl_lines)

                if "## 実装箇所" in content:
                    idx = content.find("## 実装箇所")
                    content = content[:idx] + f"## 実装箇所\n\n{impl_block}\n"
                else:
                    content += f"\n\n## 実装箇所\n\n{impl_block}\n"
            else:
                if "## 実装箇所" in content:
                    idx = content.find("## 実装箇所")
                    content = content[:idx] + f"## 実装箇所\n\n実装コード内に「{keyword}」は検出されませんでした。\n"

        file_changed = False
        if new_status != curr_status:
            if curr_status.startswith("✅") and new_status.startswith("❌"):
                regressions.append({
                    "path": rel_path,
                    "keyword": keyword,
                    "previous_status": curr_status,
                    "new_status": new_status,
                })
            content = re.sub(r'(-\s*\*\*対応状況\*\*:\s*).*', r'\1' + new_status, content)
            file_changed = True

        content = sanitize_snippet(content)

        if not dry_run and file_changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

        if file_changed:
            updated_files.append(filepath)

        if "✅" in new_status:
            category_stats[cat]["✅"] += 1
        elif "⚠️" in new_status:
            category_stats[cat]["⚠️"] += 1
        elif "❓" in new_status or "📝" in new_status:
            category_stats[cat]["❓"] += 1
        else:
            category_stats[cat]["❌"] += 1
        category_stats[cat]["合計"] += 1

    end_time = datetime.datetime.now(datetime.timezone.utc)
    perf_stats["elapsed_seconds"] = round((end_time - start_time).total_seconds(), 3)

    if compliance_dir is None:
        if docs_dir.replace('\\', '/').rstrip('/') == 'docs/spec':
            resolved_compliance_dir = 'docs/doc/compliance'
        else:
            resolved_compliance_dir = os.path.join(os.path.dirname(docs_dir.rstrip('/\\')), 'doc', 'compliance')
    else:
        resolved_compliance_dir = compliance_dir

    list_audit = verify_comparison_lists(
        docs_dir=docs_dir,
        compliance_dir=resolved_compliance_dir,
        base_dir=base_dir
    )

    report = ComplianceReport(
        category_stats=category_stats,
        updated_files=updated_files,
        total_files=len(audit_files),
        regressions=regressions,
        perf_stats=perf_stats,
        layer_summary=layer_summary,
        list_audit=list_audit
    )

    return report
