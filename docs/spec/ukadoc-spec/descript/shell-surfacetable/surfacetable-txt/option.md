# option,オプション1,オプション2,...

- **規格**: [option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/option.md)
- **検索語**: option
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shell/animation.rs:63` `options: vec![],`
- `crates/ui/src/surfacetable.rs:42` `/// `option,` の内容（任意個）`
- `crates/ui/src/surfacetable.rs:43` `pub options: Vec<Vec<String>>,`
- `crates/ui/src/surfacetable.rs:120` `"option" => {`
- `crates/ui/src/surfacetable.rs:122` `.options`
