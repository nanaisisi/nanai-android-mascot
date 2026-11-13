# talk,数値

- **規格**: [talk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk.md)
- **検索語**: talk
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:80` `"talk" => return Self::Talk,`
- `src-tauri/src/commands/window/menu_native.rs:80` `.text("talk", "💬 もう一度話す (A)")`
- `ui/ts/core/actions/menu-action-dispatcher.ts:85` `if (action === "talk") {`
- `ui/ts/ui/renderers/menu-caption-switches.ts:8` `id: "switch-activate-when-talk-btn",`
- `tests/app-actions.test.ts:37` `return "talk-result";`
- `crates/nanai-surface/src/types/draw/interval.rs:98` `"talk" => Self::Talk,`
