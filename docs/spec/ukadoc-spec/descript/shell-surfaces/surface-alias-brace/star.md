# *（任意のエイリアス名）

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star.md)
- **検索語**: *
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` において、`surfaces.txt` 内の任意のエイリアス定義キーと配列解決を行う実装が行われている。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:6` `use wasm_bindgen::prelude::*;`
- `src-tauri/capabilities/default.json:3` `"windows": ["*"],`
- `ui/assets/LICENSE-3RD-PARTY.html:86` `padding-top: 60px; /* anchor offset */`
- `ui/styles.css:3` `= */`
- `tests/async-parallel.test.ts:317` `return item * 10;`
- `crates/nanai-core/src/balloon_descript.rs:143` `use super::*;`
