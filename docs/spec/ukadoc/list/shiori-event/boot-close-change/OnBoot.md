# OnBoot

- **規格**: [OnBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBoot/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBoot.md)
- **検索語**: OnBoot
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/shiori-protocol.js:8` (コメント) `* @param {string} id - イベントID (例: "OnBoot", "OnMouseClick")`
- `ui/js/ghost/ghost-shiori.js:18` `await this.sendShioriEvent("OnBoot");`
- `ui/js/ghost/ghost-shiori.js:20` (コメント) `// OnBoot送信失敗時はスキップ`
- `src-tauri/src/shiori/ffi.rs:204` (コメント) `/// OnBootイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:208` `.header("Event", "OnBoot")`
