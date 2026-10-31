# OnChoiceEnter

- **規格**: [OnChoiceEnter.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceEnter/) (ukadoc-spec/list/shiori-event/choice/OnChoiceEnter.md)
- **検索語**: OnChoiceEnter
- **対応状況**: ✅ 実装済

## 突合結果

`\q` (選択肢ボタン) 上にマウスカーソルが乗った際 (`mouseenter`)、および外れた際 (`mouseleave`) に `OnChoiceEnter` SHIORIイベントを送信するイベントハンドラを実装 (`ui/js/ghost/sakura-play/handlers.js` -> `OnChoiceEnter`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:24` `* - OnChoiceEnter, OnChoiceHover, OnChoiceSelect, OnChoiceSelectEx, OnChoiceTime`
- `ui/js/ghost/sakura-play/handlers.js:180` `app.ghostController?.sendShioriEvent("OnChoiceEnter", [`
- `ui/js/ghost/sakura-play/handlers.js:187` `app.ghostController?.sendShioriEvent("OnChoiceEnter", []);`
