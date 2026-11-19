# \![open,balloonexplorer]

- **規格**: [bang-open-balloonexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-balloonexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-balloonexplorer.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,balloonexplorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびバルーンエクスプローラ表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`balloonexplorer`)
