# DLL 規格対応仕様 (DLL Architecture & WASM Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: DLL規格](https://ukatech.shillest.net/ukadoc-spec/spec/dll/)
- **インターフェース**: C-ABI DLL (`load`, `unload`, `request`), WebAssembly (WASM)
- **対応ステータス**: **設計・基盤開発中（60%）**

---

## 1. 規格概要と Nanai 実装方針

伺か規格における DLL は、Windows の 32bit/64bit ダイナミックリンクライブラリ（C-ABI）を前提としており、SHIORI、SAORI、PLUGIN、HEADLINE の基盤となっています。

- **クロスプラットフォームの課題**:
  - Windows x86/x64 ネイティブ DLL は Android (ARM64) や Web サンドボックス上で直接動作不可。
- **Nanai の解決策（多層フォールバック & WASM化）**:
  1. **Tier 1 (WebAssembly / WASM)**: 里々や YAYA 等のオープンソース C/C++ コアを Emscripten / Clang で WASM にコンパイルし、Windows / Android 双方で同一バイナリを実行。
  2. **Tier 2 (Pure JavaScript / Rust)**: 標準 JS SHIORI / Rust 内蔵ハンドラ。
  3. **Tier 3 (Windows ネイティブ DLL)**: Windows 環境時のみ Tauri バックエンド（Rust `libloading`）経由で C-ABI DLL を呼び出し可能。

---

## 2. C-ABI 関数マッピング

| C-ABI 関数 | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| `BOOL load(HGLOBAL h, long len)` | モジュールロード | ✅ 対応済 | 初期化データ（パス等）の受渡し。WASM/JS では `init()` に対応 |
| `BOOL unload()` | アンロード | ✅ 対応済 | メモリ解放 |
| `HGLOBAL request(HGLOBAL h, long *len)` | リクエスト処理 | ✅ 対応済 | グローバルメモリを介したテキスト要求・レスポンス受渡し |
