# sstp : 概要

- **規格**: [sstp.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/sstp/) (ukadoc-spec/spec/sstp/sstp.md)
- **対応状況**: ✅ 実装済

## 突合結果

SSTP 未対応。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:161` `let content = "arrow.filename,arrow.png\nmarker.filename=marker.png\nclickwaitma`
- `src-tauri/src/lib.rs:25` `mod sstp;`
- `ui/ts/core/app-actions.ts:16` `export * from "./actions/sstp-fmo-actions.js";`
- `ui/css/balloon-window.css:286` `.sstp-marker {`
- `tests/sstp-fmo-integration.test.ts:6` `import "./sstp-fmo/sstp-actions.test.js";`
- `crates/nanai-core/src/balloon_descript.rs:168` `assert_eq!(opts.sstp_marker_filename(), Some("sstp.png"));`
