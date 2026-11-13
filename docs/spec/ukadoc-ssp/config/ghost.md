# 設定：ゴースト(1)

- **規格**: [config/ghost.md](https://ukatech.shillest.net/ukadoc-ssp/config/ghost/) (ukadoc-ssp/config/ghost.md)
- **対応状況**: ✅ 実装済

## 突合結果

デフォルトゴースト設定、移動制約

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:24` `let rec_name = get_prop("recommended.ghost").map(|s| s.trim()).filter(|s| !s.is_`
- `src-tauri/shiori-host/src/main.rs:261` `let p = std::path::Path::new("ghost/master");`
- `ui/main.ts:21` `import { GhostController } from "./ts/ghost/ghost.js";`
- `ui/balloon.html:10` `<script type="module" src="ts/ghost/balloon-window.ts"></script>`
- `tests/app-actions.test.ts:51` `await handle("ghost-info");`
- `crates/nanai-core/src/balloon_descript.rs:25` `let rec_path = get_prop("recommended.ghost.path").map(|s| s.trim()).filter(|s| !`
