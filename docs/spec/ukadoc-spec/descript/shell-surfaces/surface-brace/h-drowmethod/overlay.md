# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay.md)
- **検索語**: overlay
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:11` `pub method: String, // overlay, base, add, replace, move`
- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::Overlay => "overlay".to_string(),`
- `ui/ts/core/actions/ghost-actions.ts:25` `if (!ghost || !modal?.content || !modal?.overlay) {`
- `ui/index.html:106` `<div class="modal-overlay" id="modal-overlay" style="display: none">`
- `tests/android-bridge.test.ts:6` `import "./android-bridge/platform-overlay.test.js";`
- `crates/nanai-core/src/seriko_animation.rs:89` `method: "overlay".to_string(),`
