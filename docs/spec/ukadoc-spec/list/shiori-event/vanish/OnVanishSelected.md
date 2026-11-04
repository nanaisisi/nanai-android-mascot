# OnVanishSelected

- **規格**: [OnVanishSelected.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/vanish/OnVanishSelected/) (ukadoc-spec/list/shiori-event/vanish/OnVanishSelected.md)
- **検索語**: OnVanishSelected
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnVanishSelected」が見つからない。


## 実装箇所

- `ui/js/ghost/shiori-notify.js:28` `* - OnVanished, OnVanishSelecting, OnVanishSelected, OnVanishCancel, OnVanishBut`
- `ui/js/ghost/shiori-notify.js:285` `* 消滅・アンインストール通知 (OnVanished, OnVanishSelecting, OnVanishSelected, OnVanishCancel`
- `ui/js/ghost/command-handler/ghost.js:72` `await gc.sendShioriEvent("OnVanishSelected", []);`
- `ui/js/ghost/command-handler/ghost.js:74` `console.warn("OnVanishSelected event failed:", e);`
