# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `src-tauri/tauri.conf.json:22` `"alwaysOnTop": true,`
- `src-tauri/src/commands/window/loading_banner_window.rs:71` `.always_on_top(true)`
- `src-tauri/src/commands/window/character_window.rs:68` `.always_on_top(true)`
- `src-tauri/src/commands/window/balloon_window.rs:81` `.always_on_top(true)`
- `src-tauri/src/commands/window/balloon_window.rs:220` `.always_on_top(true)`
