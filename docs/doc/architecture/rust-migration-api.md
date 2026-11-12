# 各論1：API利用・Web API連携におけるWASMの優位性

## 1. Web標準 API との直接結合

- **`web-sys` / `js-sys` の活用**:
  - Rust から直接、ブラウザや Tauri WebView が提供する Canvas 2D 描画コンテキスト、`requestAnimationFrame`、`AudioContext`、`fetch`、DOM操作などを型安全に呼び出すことが可能。
- **IPC との統合**:
  - Tauri のバックエンド IPC 呼び出しとフロントエンドの Web API 操作を Rust という単一の言語コンテキスト内でシームレスにブリッジ。
