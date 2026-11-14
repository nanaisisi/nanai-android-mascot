# Split scripts/verify_spec_compliance.py into 8 Modular Parts (<9KB each)

Refactor the monolithic `scripts/verify_spec_compliance.py` script into 8 modular files under `scripts/compliance/` and a thin orchestration wrapper `scripts/verify_spec_compliance.py`. Each module will be well under 9KB, maintainable, and fully backward-compatible.

## Proposed Changes

### [NEW] [config.py](scripts/compliance/config.py)

- Constants (`GENERIC_KEYWORDS`, `LAYER_ORDER`, `KNOWN_LAYERS`, `MAX_MATCHES_PER_LAYER`, `MAX_IMPL_LOCATIONS`) and shared regexes.

### [NEW] [loader.py](scripts/compliance/loader.py)

- Codebase loading (`load_codebase`), layer classification (`classify_layer`), snippet sanitization (`sanitize_snippet`), and valid code match checks (`is_valid_code_match`).

### [NEW] [search.py](scripts/compliance/search.py)

- Keyword parsing (`parse_keywords`), wildcard regex builder (`build_wildcard_regex`), search execution (`search_keyword`), match selection (`select_representative_matches`), and layer summary initialization (`init_layer_summary`).

### [NEW] [report.py](scripts/compliance/report.py)

- `ComplianceReport` class for statistics calculation, JSON serialization, and Markdown report generation.

### [NEW] [audit.py](scripts/compliance/audit.py)

- Audit file helpers (`is_spec_item_readme`, `is_category_table_index`, `is_spec_audit_file`, `get_actual_filename`) and main audit processor (`process_audit_files`).

### [NEW] [sync.py](scripts/compliance/sync.py)

- Summary file updates (`update_summary`), category README synchronization (`sync_category_readmes`), Git conflict detection (`detect_git_conflicts`), and parallel branch safety checks (`validate_parallel_bulk_safety`, `is_parallel_branch`).

### [NEW] [verify.py](scripts/compliance/verify.py)

- Comparison lists verification (`verify_comparison_lists`), table corruption detection (`has_corrupted_table_rows`), and regexes for list validation.

### [MODIFY] [verify_spec_compliance.py](scripts/verify_spec_compliance.py)

- Thin orchestrator script containing `parse_args()` and `main()`, importing all components from `scripts.compliance`.

## Verification Plan

### Automated Tests

- Run `python scripts/verify_spec_compliance.py --dry-run` to verify that execution succeeds without errors.
- Run `python scripts/verify_spec_compliance.py --check-lists --check-layers` to ensure all audit features and report outputs remain identical.
- Check file sizes of all newly created modules to ensure they are strictly under 9KB.
