# \![open,dressupexplorer]

- **規格**: [bang-open-dressupexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-dressupexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-dressupexplorer.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,dressupexplorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびドレスアップ (着せ替え) エクスプローラモーダル表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`dressupexplorer`)
