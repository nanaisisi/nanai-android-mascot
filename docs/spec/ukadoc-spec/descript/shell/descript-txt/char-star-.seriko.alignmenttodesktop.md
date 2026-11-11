# char\*.seriko.alignmenttodesktop,位置情報

- **規格**: [char-star-.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.seriko.alignmenttodesktop/) (ukadoc-spec/descript/shell/descript-txt/char-star-.seriko.alignmenttodesktop.md)
- **検索語**: char
- **対応状況**: ⚠️ 一部対応

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:91` `(b as char).to_string()`
- `src-tauri/src/ghost/scan/directory/manifest.rs:71` `if let Some(rest) = k.strip_prefix("char")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:133` `if let Some(rest) = k.strip_prefix("char")`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:49` `"char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:50` `"char.popupmenu.applybindtoself" | "char.popupmenu.type" | "char.popupmenu.visib`
