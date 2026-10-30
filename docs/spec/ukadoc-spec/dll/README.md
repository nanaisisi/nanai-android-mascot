# dll 項目別突合

規格 (ukadoc-spec/spec/dll.md) の見出し単位の突合結果です。実装コード（`src-tauri/src/shiori/dynamic.rs` 等）に対応が完了しています。

| 項目 | 対応状況 | 備考 |
| :--- | :---: | :--- |
| [DLL共通仕様](01.md) | ✅ 対応済 (src-tauri/src/shiori/) | SHIORI 用 DLL ローダー (`libloading` / `GlobalAlloc` 準拠メモリ管理) で実装済 |
| [メモリ管理](02.md) | ✅ 対応済 (src-tauri/src/shiori/) | `GlobalAlloc` / `GlobalFree` 互換のポインタ確保・解放処理実装済 |
| [request関数](03.md) | ✅ 対応済 (src-tauri/src/shiori/) | `load`, `request`, `unload` エントリポイントのバインドと呼び出し実装済 |
| [ライフサイクル関数 (loadu)](04.md) | ✅ 対応済 (src-tauri/src/shiori/) | `load` / `loadu` および `unload` / `unloadu` のライフサイクル関数対応済 |
