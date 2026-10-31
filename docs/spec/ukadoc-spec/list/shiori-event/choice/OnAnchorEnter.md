# OnAnchorEnter

- **規格**: [OnAnchorEnter.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorEnter/) (ukadoc-spec/list/shiori-event/choice/OnAnchorEnter.md)
- **検索語**: OnAnchorEnter
- **対応状況**: ✅ 実装済

## 突合結果

`\_a` (アンカー要素) 上にマウスカーソルが乗った際 (`mouseenter`)、および外れた際 (`mouseleave`) に `OnAnchorEnter` SHIORIイベントを送信するイベントハンドラを実装 (`ui/js/ghost/sakura-play/handlers.js` -> `OnAnchorEnter`)。

- マウス進入時: Reference0: ジャンパテキスト, Reference1: ジャンパID, Reference2..: 拡張引数
- マウス退出時: 引数なし (空Reference)

## 実装箇所

- `ui/js/ghost/shiori-notify.js:23` `* - OnAnchorEnter, OnAnchorHover, OnAnchorSelect, OnAnchorSelectEx`
- `ui/js/ghost/sakura-play/handlers.js:121` `app.ghostController?.sendShioriEvent("OnAnchorEnter", [`
- `ui/js/ghost/sakura-play/handlers.js:128` `app.ghostController?.sendShioriEvent("OnAnchorEnter", []);`
