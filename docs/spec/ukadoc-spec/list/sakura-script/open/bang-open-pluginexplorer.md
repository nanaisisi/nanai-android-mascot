# \![open,pluginexplorer]

- **規格**: [bang-open-pluginexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-pluginexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-pluginexplorer.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,pluginexplorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびプラグインエクスプローラ表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`pluginexplorer`)
