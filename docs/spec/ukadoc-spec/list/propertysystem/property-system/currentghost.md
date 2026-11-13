# currentghost.汎用プロパティ名

- **規格**: [currentghost.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/currentghost/) (ukadoc-spec/list/propertysystem/property-system/currentghost.md)
- **検索語**: currentghost.
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「currentghost.」を確認。

## 実装箇所

- `crates/nanai-surface/src/types/txt/surfaces_txt/core/definition.rs:51` `/// 定義済みの全サーフィスID（昇順）を取得する (`currentghost.seriko.surfacelist.defined`)`
- `src-tauri/src/shiori/property/tests.rs:14` `assert_eq!(evaluate_property_query("currentghost.name"), "Mock Ghost");`
- `ui/ts/ghost/command-handler/env.ts:140` `case "currentghost.name":`
- `tests/sakura-command-handler/cycle11-commands.test.ts:19` `if (prop === "currentghost.name") return "SakuraGhost";`
- `crates/nanai-surface/src/types/txt/surfaces_txt/core/definition.rs:56` `/// 定義済みおよびエイリアスを含むすべての利用可能サーフィスID（昇順・重複なし）を取得する (`currentghost.seriko.surfaceli`
- `src-tauri/src/shiori/property/tests.rs:65` `assert_eq!(evaluate_property_query("currentghost.balloon.count"), "1");`
