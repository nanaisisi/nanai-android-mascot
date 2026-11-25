# SSTP通信

- **規格**: [conn2.md](../../../../ukadoc-ssp/config/conn2.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/conn2/))
- **検索語**: sstp, 9801, 9821
- **対応状況**: ✅ 実装済

## 突合結果

SSTP 通信の待ち受け・タイムアウト・受信制御設定は未実装。


## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:179` `let content = "arrow.filename,arrow.png\nmarker.filename=marker.png\nclickwaitma`
- `src-tauri/src/invoke.rs:7` `use crate::sstp;`
- `ui/ts/core/app-actions.ts:17` `export * from "./actions/sstp-fmo-actions.js";`
- `ui/css/balloon-window.css:388` `.sstp-marker {`
- `tests/balloon-assets.test.ts:64` `it("falls back markers.png -> marker.png -> sstp.png for scopeId 0", async () =>`
- `crates/nanai-core/src/balloon_descript.rs:186` `assert_eq!(opts.sstp_marker_filename(), Some("sstp.png"));`
