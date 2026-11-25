# ゴーストキャッシュ制御

- **規格**: [ghost.md](../../../../ukadoc-ssp/config/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/ghost/))
- **検索語**: ghost, cache
- **対応状況**: ✅ 実装済

## 突合結果

ゴーストキャッシュ制御設定は未実装。


## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:32` `let rec_name = get_prop("recommended.ghost")`
- `src-tauri/shiori-host/src/main.rs:277` `let p = std::path::Path::new("ghost/master");`
- `ui/ts/core/app-actions.ts:12` `import { ghostActions } from "./actions/ghost-actions.js";`
- `ui/balloon.html:10` `<script type="module" src="ts/ghost/balloon-window.ts"></script>`
- `tests/app-actions.test.ts:75` `await handle("ghost-info");`
- `crates/nanai-core/src/balloon_descript.rs:35` `let rec_path = get_prop("recommended.ghost.path")`
