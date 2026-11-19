# 自動的に除外される対象

- **規格**: [caption_ignore.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/caption_ignore/) (ukadoc-spec/descript/install/developer_options.txt/caption_ignore.md)
- **検索語**: 自動的に除外される対象
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/packaging.rs` において `IGNORE_FILE_NAMES`（`desktop.ini`, `thumbs.db`, `folder.htt`, `mscreate.dir`, `.ds_store`, `_catalog.vix`）および `IGNORE_DIR_NAMES`（`profile`, `var`, `__macosx`, `xtrastuf.mac`）の自動除外ルールが完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs` (`IGNORE_FILE_NAMES`, `IGNORE_DIR_NAMES`)
