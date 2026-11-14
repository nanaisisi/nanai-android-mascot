"""
scripts/compliance/sync_readmes.py

Category README synchronization logic.
"""

import os
import re
from scripts.compliance.audit_helpers import (
    is_spec_audit_file,
    is_spec_item_readme,
    is_category_table_index,
)
from scripts.compliance.verify import has_corrupted_table_rows


def sync_category_readmes(docs_dir='docs/spec', dry_run=False, target_category=None):
    """
    Synchronizes or regenerates category-level README.md files from individual *.md files.
    """
    norm_docs_dir = docs_dir.replace('\\', '/').rstrip('/') + '/'
    candidate_dirs = set()

    for root, dirs, files in os.walk(docs_dir):
        has_spec_md = any(
            f.endswith('.md') and is_spec_audit_file(os.path.join(root, f))
            for f in files
        )
        has_parent_readme = ('README.md' in files and bool(dirs))
        if has_spec_md or has_parent_readme:
            candidate_dirs.add(root)

    updated_readmes = []

    for cdir in sorted(candidate_dirs):
        norm_cdir = cdir.replace('\\', '/')
        rel_path = norm_cdir.replace(norm_docs_dir, '')
        parts = rel_path.split('/')
        cat = f'{parts[0]}/{parts[1]}' if len(parts) >= 2 and not parts[1].endswith('.md') else parts[0]

        if target_category:
            norm_target = target_category.replace('\\', '/').strip('/')
            matches_target = (
                rel_path == norm_target or
                rel_path.startswith(norm_target + '/') or
                cat == norm_target or
                cat.startswith(norm_target + '/')
            )
            if not matches_target:
                continue

        dir_entries = os.listdir(cdir) if os.path.isdir(cdir) else []

        if 'readme.md' in dir_entries or is_spec_item_readme(os.path.join(cdir, 'README.md')):
            continue

        if 'index.md' in dir_entries and is_category_table_index(os.path.join(cdir, 'index.md')) and 'README.md' not in dir_entries:
            continue

        category_name = rel_path
        md_files = [
            os.path.join(cdir, f) for f in dir_entries
            if f.endswith('.md') and is_spec_audit_file(os.path.join(cdir, f))
        ]
        md_files.sort(key=lambda x: os.path.basename(x).lower())

        child_dirs = []
        for entry in sorted(dir_entries):
            sub_path = os.path.join(cdir, entry)
            if os.path.isdir(sub_path):
                sub_entries = os.listdir(sub_path)
                has_child_content = any(sf.endswith('.md') for sf in sub_entries)
                if has_child_content:
                    child_dirs.append(entry)

        readme_path = os.path.join(cdir, 'README.md')
        existing_content = None
        if 'README.md' in dir_entries and os.path.isfile(readme_path):
            with open(readme_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()

        if child_dirs and (not md_files or (existing_content and has_corrupted_table_rows(existing_content, cdir))):
            if (
                existing_content
                and not has_corrupted_table_rows(existing_content, cdir)
                and all(f'{sub}/' in existing_content for sub in child_dirs)
                and all(os.path.basename(mf) in existing_content for mf in md_files)
            ):
                continue

            lines = [
                f'# {category_name} 項目別突合',
                '',
                '各サブカテゴリおよび仕様項目の突合一覧です。',
                '',
                '| 項目 / サブカテゴリ | 検索語 / 項目数 | 対応状況 |',
                '| :--- | :----- | :------: |'
            ]
            for sub in child_dirs:
                sub_path = os.path.join(cdir, sub)
                sub_entries = os.listdir(sub_path)
                target_doc = 'README.md' if 'README.md' in sub_entries else ('index.md' if 'index.md' in sub_entries else 'README.md')
                sub_specs = [
                    os.path.join(sub_path, sf) for sf in sub_entries
                    if sf.endswith('.md') and is_spec_audit_file(os.path.join(sub_path, sf))
                ]
                ok_c = part_c = ng_c = 0
                for sf in sub_specs:
                    with open(sf, 'r', encoding='utf-8') as f:
                        sc = f.read()
                    st_m = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', sc)
                    st_val = st_m.group(1).strip() if st_m else ''
                    if '✅' in st_val:
                        ok_c += 1
                    elif '⚠️' in st_val:
                        part_c += 1
                    else:
                        ng_c += 1
                total_c = len(sub_specs)
                status_str = f'✅ {ok_c} / ⚠️ {part_c} / ❌ {ng_c}' if total_c > 0 else '✅ 対応済'
                lines.append(f'| [{sub}]({sub}/{target_doc}) | {total_c}件 | {status_str} |')

            for mf in md_files:
                basename = os.path.basename(mf)
                name_no_ext = os.path.splitext(basename)[0]
                with open(mf, 'r', encoding='utf-8') as f:
                    content = f.read()
                title_m = re.search(r'^#\s*([^\r\n]+)', content)
                item_title = title_m.group(1).strip() if title_m else name_no_ext
                kw_m = re.search(r'-\s*\*\*検索語\*\*:\s*([^\r\n]+)', content)
                keyword = kw_m.group(1).strip() if kw_m else name_no_ext
                st_m = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', content)
                status = st_m.group(1).strip() if st_m else '❓ 未確認'
                lines.append(f'| [{item_title}]({basename}) | {keyword} | {status} |')

            lines.append('')
            new_content = '\n'.join(lines)
        else:
            if not md_files:
                continue
            if (
                child_dirs
                and existing_content
                and not has_corrupted_table_rows(existing_content, cdir)
                and any(f'{sub}/' in existing_content for sub in child_dirs)
            ):
                continue

            lines = [
                f'# {category_name} 項目別突合',
                '',
                '実装コードの文字列検索による一次調査です。',
                '',
                '| 項目 | 検索語 | 対応状況 |',
                '| :--- | :----- | :------: |'
            ]

            for mf in md_files:
                basename = os.path.basename(mf)
                name_no_ext = os.path.splitext(basename)[0]
                with open(mf, 'r', encoding='utf-8') as f:
                    content = f.read()

                title_m = re.search(r'^#\s*([^\r\n]+)', content)
                item_title = title_m.group(1).strip() if title_m else name_no_ext

                kw_m = re.search(r'-\s*\*\*検索語\*\*:\s*([^\r\n]+)', content)
                keyword = kw_m.group(1).strip() if kw_m else name_no_ext

                st_m = re.search(r'-\s*\*\*対応状況\*\*:\s*([^\r\n]+)', content)
                status = st_m.group(1).strip() if st_m else '❓ 未確認'

                lines.append(f'| [{item_title}]({basename}) | {keyword} | {status} |')

            lines.append('')
            new_content = '\n'.join(lines)

        if existing_content != new_content:
            if not dry_run:
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            updated_readmes.append(readme_path.replace('\\', '/'))

    return updated_readmes
