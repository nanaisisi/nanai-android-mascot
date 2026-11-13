# import,ファイル名,ウエイトmsec,X,Y

- **規格**: [import.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/import/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/import.md)
- **検索語**: import
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.js:917` `module_or_path = new URL('nanai_core_bg.wasm', import.meta.url);`
- `ui/bindings.ts:3` `import { invoke as __TAURI_INVOKE } from "@tauri-apps/api/core";`
- `ui/styles.css:5` `@import url("./css/base.css");`
- `tests/android-bridge.test.ts:6` `import "./android-bridge/platform-overlay.test.js";`
- `crates/ui/ts/core/wasm/pkg/nanai_core.js:797` `module_or_path = new URL('nanai_core_bg.wasm', import.meta.url);`
- `ui/main.ts:12` `import { DictationManager } from "./ts/core/actions/dictation.js";`
