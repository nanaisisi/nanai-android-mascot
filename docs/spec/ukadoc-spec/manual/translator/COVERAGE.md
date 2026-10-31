# トランスレータ仕様 100%カバー対応表

- **規格参照元**: [`docs/ukadoc-spec/manual/translator.md`](../../../../ukadoc-spec/manual/translator.md)
- **判定基準**: `docs/ukadoc-spec/manual/translator.md` に記載されている `makoto.dll` および `OnTranslate` パイプラインの実装状況

| 項目 (`manual/translator.md`) | 当リポジトリの監査ファイル (`manual/translator/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`makoto.dll` (トランスレータロード)** | [script-pipeline.md](script-pipeline.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`OnTranslate` イベントフック** | [ontranslate-event.md](ontranslate-event.md) | ✅ 実装済 | [`protocol.rs`](../../../../src-tauri/src/commands/shiori/protocol.rs), [`translator.js`](../../../../ui/js/ghost/sakura-play/translator.js) |
