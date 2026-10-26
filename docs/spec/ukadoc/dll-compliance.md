# DLL 規格対応仕様 (DLL Architecture & WASM Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: DLL規格](https://ukatech.shillest.net/ukadoc-spec/spec/dll/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **PLUGIN 規格**: [ukadoc-spec: plugin](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **SAORI 規格**: [ukadoc-spec: saori](https://ukatech.shillest.net/ukadoc-spec/spec/saori/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

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

| C-ABI 関数                              | 仕様             | 対応状況  | 動作仕様・備考                                               |
| :-------------------------------------- | :--------------- | :-------: | :----------------------------------------------------------- |
| `BOOL load(HGLOBAL h, long len)`        | モジュールロード | ✅ 対応済 | 初期化データ（パス等）の受渡し。WASM/JS では `init()` に対応 |
| `BOOL unload()`                         | アンロード       | ✅ 対応済 | メモリ解放                                                   |
| `HGLOBAL request(HGLOBAL h, long *len)` | リクエスト処理   | ✅ 対応済 | グローバルメモリを介したテキスト要求・レスポンス受渡し       |
