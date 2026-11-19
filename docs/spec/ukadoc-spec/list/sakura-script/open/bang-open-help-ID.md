# \![open,help,ダイアログID]

- **規格**: [bang-open-help-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-help-ID/) (ukadoc-spec/list/sakura-script/open/bang-open-help-ID.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,help,ダイアログID]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) および UKADOC/SSP ヘルプ URL のブラウザ展開処理 (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/system/target.ts` (`help`)
