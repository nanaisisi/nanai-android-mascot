# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:69` `kind: "element",`
- `src-tauri/src/commands/shell/manifest.rs:91` `"element".hash(&mut hasher);`
- `crates/ui/src/manifest.rs:136` `manifest.surfaces[0].definition.element(0).unwrap().file,`
- `crates/ui/src/shell/tests.rs:22` `assert!(def0.element(0).is_some());`
- `crates/ui/src/surfaces/compositor/mod.rs:7` `pub mod element;`
