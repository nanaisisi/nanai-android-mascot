# ネットワーク更新対象の種別

- **規格**: [caption_updatetype.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/caption_updatetype/) (ukadoc-spec/list/shiori-event/network-update/caption_updatetype/)
- **検索語**: ネットワーク更新対象の種別
- **対応状況**: ⚠️ 一部対応

## 突合結果

各更新イベントの Reference3 に種別 "ghost" を使用している (ゴースト本体の更新のみ対応のため)。shell / balloon / plugin / headline 種別の更新は未対応。

## 実装箇所

- `ui/js/core/app-update.js` (各 sendShioriEvent の各第4引数 `"ghost"`)
