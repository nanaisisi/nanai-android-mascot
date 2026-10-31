# refresh,数値

- **規格**: [refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refresh.md)
- **検索語**: refresh
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refresh` キーをパース・参照する実装が行われている。

## 実装箇所

- `ui/js/ui/modal-explorer.js:95` `?.querySelector("#explorer-refresh-btn")`
- `ui/js/ui/templates/ghost-templates.js:8` `<button type="button" id="explorer-refresh-btn">再読み込み</button>`
- `ui/js/ui/templates/ghost-templates.js:53` `<button type="button" id="refresh-ghosts-btn">更新</button>`
- `ui/js/ui/templates/ghost-templates.js:75` `<button type="button" id="refresh-balloons-btn">更新</button>`
