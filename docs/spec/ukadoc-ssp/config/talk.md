# 設定：喋り/バルーン

- **規格**: [config/talk.md](https://ukatech.shillest.net/ukadoc-ssp/config/talk/) (ukadoc-ssp/config/talk.md)
- **対応状況**: ✅ 実装済

## 突合結果

自動トーク頻度設定、バルーン消去待ち時間

## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:80` `"talk" => return Self::Talk,`
- `src-tauri/src/commands/window/menu_native.rs:80` `.text("talk", "💬 もう一度話す (A)")`
- `ui/ts/core/actions/menu-action-dispatcher.ts:85` `if (action === "talk") {`
- `ui/ts/ui/renderers/menu-caption-switches.ts:8` `id: "switch-activate-when-talk-btn",`
- `tests/app-actions.test.ts:37` `return "talk-result";`
- `crates/nanai-surface/src/types/draw/interval.rs:98` `"talk" => Self::Talk,`
