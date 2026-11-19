# \![open,explorer,ファイル]

- **規格**: [bang-open-explorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-explorer/) (ukadoc-spec/list/sakura-script/open/bang-open-explorer.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,explorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびエクスプローラ表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`explorer`)
