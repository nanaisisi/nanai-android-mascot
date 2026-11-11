# 基本的な使い方：ゴーストとあそぶ

- **規格**: [howto/use.md](https://ukatech.shillest.net/ukadoc-ssp/howto/use/) (ukadoc-ssp/howto/use.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

タッチ/ドラッグ、クリック/ダブルクリック判定、当たり判定、着せ替え

## 実装箇所

- `src-tauri/build.rs:1` `use std::path::Path;`
- `src-tauri/build_old.rs:1` `use std::path::Path;`
- `src-tauri/build_stub.rs:1` `use std::path::Path;`
- `src-tauri/shiori-host/src/ffi.rs:1` `use std::ffi::c_void;`
- `src-tauri/shiori-host/src/ffi.rs:24` `use std::os::windows::ffi::OsStrExt;`
