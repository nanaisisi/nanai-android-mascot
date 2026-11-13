# system:wait

- **規格**: [system-wait.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-wait/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-wait.md)
- **検索語**: system
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:58` `mouseup0,Head,system:hand`
- `src-tauri/shiori-host/src/ffi.rs:10` `extern "system" {`
- `ui/assets/LICENSE-3RD-PARTY.html:23` `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, A`
- `ui/css/base.css:26` `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
- `tests/command-handler-boost.test.ts:11` `} from "../ui/ts/ghost/command-handler/system/desktop.js";`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/points_ui.rs:59` `mousedown0,Head,system:finger`
