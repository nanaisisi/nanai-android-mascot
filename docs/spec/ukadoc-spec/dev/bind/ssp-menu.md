# SSPの着せ替えメニュー設定あれこれ

- **規格**: [bind.md](../../../../ukadoc-spec/dev/bind.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/bind/))
- **検索語**: bind.menu
- **対応状況**: ⚠️ 一部対応

## 突合結果

着せ替えメニューの表示・カテゴリ分け・選択状態管理に対応。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:82` `assert_eq!(evaluate_property_query("sakura.bind.menu"), "auto");`
- `ui/ts/ghost/command-handler/env.ts:185` `case "sakura.bind.menu":`
- `src-tauri/src/shiori/property/tests.rs:83` `assert_eq!(evaluate_property_query("kero.bind.menu"), "auto");`
- `ui/ts/ghost/command-handler/env.ts:186` `case "kero.bind.menu":`
- `src-tauri/src/shiori/property/tests.rs:84` `assert_eq!(evaluate_property_query("char0.bind.menu"), "auto");`
- `ui/ts/ghost/command-handler/env.ts:191` `if (key.endsWith(".bind.menu") || key.endsWith(".menu"))`
