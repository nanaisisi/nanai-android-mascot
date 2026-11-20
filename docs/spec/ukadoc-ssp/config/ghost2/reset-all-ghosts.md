# 全ゴーストの設定を標準に戻す

- **規格**: [ghost2.md](../../../../ukadoc-ssp/config/ghost2.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/ghost2/))
- **検索語**: ghost2, reset
- **対応状況**: ✅ 実装済

## 突合結果

全ゴーストの設定一括リセットボタンは未実装。


## 実装箇所

- `ui/ts/ui/templates/settings-templates.ts:15` `<button type="button" class="ssp-tab-btn" data-tab="ghost2" style="padding: 3px `
- `tests/shiori-notify/helpers.ts:109` `path: "/assets/ghost/ghost2",`
