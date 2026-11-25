# 喋る時に手前に出て来る

- **規格**: [eachghost.md](../../../../ukadoc-ssp/config/eachghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/eachghost/))
- **検索語**: eachghost, activate
- **対応状況**: ⚠️ 一部対応

## 突合結果

喋る時に手前に出てくる設定のゴースト別管理は未実装。


## 実装箇所

- `ui/ts/ui/renderers/menu-caption-general.ts:12` `id: "activate-root-btn",`
- `ui/ts/ui/renderers/menu-caption-switches.ts:8` `id: "switch-activate-when-talk-btn",`
- `ui/ts/ui/renderers/menu-caption-switches.ts:14` `id: "switch-activate-when-talk-except-update-btn",`
- `ui/ts/ui/renderers/menu-caption-switches.ts:62` `id: "switch-dont-activate-btn",`
