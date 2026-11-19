# \![open,ipinput,ID,表示時間,IP1桁目,IP2桁目,IP3桁目,IP4桁目,オプション]

- **規格**: [bang-open-ipinput-ID-IP1-IP2-IP3-IP4.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-ipinput-ID-IP1-IP2-IP3-IP4/) (ukadoc-spec/list/sakura-script/open/bang-open-ipinput-ID-IP1-IP2-IP3-IP4.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

`\![open,ipinput,...]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`), コマンドディスパッチ (`ui/ts/ghost/command-handler/inputbox.ts` -> `openIpInput`), および 4 桁 IP アドレス入力 4 フィールドコントロール (`ui/ts/ui/renderers/inputs/advanced/ip-input.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs` (`OpenDialog`)
- `ui/ts/ghost/command-handler/inputbox.ts` (`openIpInput`)
- `ui/ts/ui/renderers/inputs/advanced/ip-input.ts` (`openIpInput`)
