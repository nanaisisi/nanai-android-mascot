# url,URL

- **規格**: [url.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/url.md)
- **検索語**: url
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/ext.rs` において `url` キーをパースし、`HeadlineInfo.url` へ設定する実装が行われている。

## 実装箇所

- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.js:840` `throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fet`
- `src-tauri/src/commands/ext.rs:111` `let url = map`
- `ui/assets/LICENSE-3RD-PARTY.html:2575` `<li><a href="https://github.com/servo/rust-url" target="_blank" rel="noopener">f`
- `ui/styles.css:5` `@import url("./css/base.css");`
- `tests/balloon-theme-manager.test.ts:115` `assert.ok(nineSlice.cssBorderImage.includes("url("));`
- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.js:917` `module_or_path = new URL('nanai_core_bg.wasm', import.meta.url);`
