# char\*.bindoption\*.group,カテゴリ名,オプション

- **規格**: [char-star-.bindoption-star-.group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.bindoption-star-.group/) (ukadoc-spec/descript/shell/descript-txt/char-star-.bindoption-star-.group.md)
- **検索語**: char
- **対応状況**: ⚠️ 一部対応

## 突合結果

ヒットしたのは一般的な語「char」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:91` `(b as char).to_string()`
- `src-tauri/src/ghost/scan/directory/manifest.rs:71` `if let Some(rest) = k.strip_prefix("char")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:133` `if let Some(rest) = k.strip_prefix("char")`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:49` `"char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:50` `"char.popupmenu.applybindtoself" | "char.popupmenu.type" | "char.popupmenu.visib`
