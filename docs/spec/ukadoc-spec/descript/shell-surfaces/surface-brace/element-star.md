# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:98` `if trimmed.to_ascii_lowercase().starts_with("element") {`
- `src-tauri/src/commands/shell/manifest.rs:69` `kind: "element",`
- `ui/ts/core/internal-window-manager.ts:49` `element: HTMLElement;`
- `ui/ts/ui/touch/android-bridge.ts:67` `element: options.element,`
- `tests/app-events.test.ts:274` `test("eventMethods covers edge branches in setupGhostInteractions (null element)`
- `crates/nanai-surface/src/compositor/mod.rs:8` `pub mod element;`
