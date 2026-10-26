# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ✅ 実装済 (Rust パーサー `crates/ui/src/surfacetable.rs` で解析・データ化済 / 表示側は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `crates/ui/src/surfacetable.rs` （Rust 版 surfacetable.txt パーサー：charset / version / scope / option / group / サーフィスID・名前 解析）

- `ui/js/ui/templates/settings-templates.js:40` `<option value="50">50%</option>`
- `ui/js/ui/templates/settings-templates.js:41` `<option value="75">75%</option>`
- `ui/js/ui/templates/settings-templates.js:42` `<option value="100" selected>100% (標準)</option>`
- `ui/js/ui/templates/settings-templates.js:43` `<option value="125">125%</option>`
- `ui/js/ui/templates/settings-templates.js:44` `<option value="150">150%</option>`
