# \![open,shellexplorer]

- **規格**: [bang-open-shellexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-shellexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-shellexplorer.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,shellexplorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびシェルエクスプローラ表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`shellexplorer`)
