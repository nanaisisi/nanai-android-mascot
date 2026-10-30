# sakura.bindoption\*.group,カテゴリ名,オプション

- **規格**: [sakura.bindoption-star-.group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.bindoption-star-.group/) (ukadoc-spec/descript/shell/descript-txt/sakura.bindoption-star-.group.md)
- **検索語**: sakura.bindoption
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「sakura.bindoption」が見つからない。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:103` `// [sakura.bindoption*.group,カテゴリ名,オプション], [kero.bindoption*.group,カテゴリ名,オプション],`
- `crates/ui/src/descript/tests.rs:7` `sakura.bindoption.group,服,multiple\r\n\`
- `ui/js/surface/bind-menu.js:12` `return scopeId === 0 ? "sakura.bindoption.group" : "kero.bindoption.group";`
- `tests/bind-menu.test.js:18` `assert.equal(bindOptionKey(0), "sakura.bindoption.group");`
- `tests/bind-menu.test.js:29` `"sakura.bindoption.group": "Hat,multiple",`
