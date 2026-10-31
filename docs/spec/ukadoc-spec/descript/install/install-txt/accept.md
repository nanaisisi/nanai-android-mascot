# accept,本体側名

- **規格**: [accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/accept.md)
- **検索語**: accept
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `accept` キーをパースし、受け入れベースウェア判定を行う実装が行われている。

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js:45` `<input type="file" id="ghost-archive-input" accept=".nar,.zip" style="flex: 1 1 `
