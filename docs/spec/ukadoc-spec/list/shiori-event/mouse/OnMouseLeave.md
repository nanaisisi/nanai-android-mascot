# OnMouseLeave

- **規格**: [OnMouseLeave.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseLeave/) (ukadoc-spec/list/shiori-event/mouse/OnMouseLeave.md)
- **検索語**: OnMouseLeave
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnMouseLeave」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:27` `* - OnMouseEnter, OnMouseLeave, OnMouseClickEx, OnMouseDoubleClickEx, OnMouseDow`
- `ui/js/ghost/shiori-notify.js:28` `* - OnMouseMultipleClick, OnMouseMultipleClickEx, OnMouseEnterAll, OnMouseLeaveA`
- `ui/js/ghost/shiori-notify.js:217` `* マウス拡張イベント (OnMouseEnter / OnMouseLeave / OnMouseEnterAll / OnMouseLeaveAll / O`
- `ui/js/core/app-events.js:202` `* マウス当たり判定退出通知 (OnMouseLeave / OnMouseLeaveAll)`
- `ui/js/core/app-events.js:207` `const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";`
