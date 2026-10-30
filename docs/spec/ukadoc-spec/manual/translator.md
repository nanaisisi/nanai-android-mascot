# トランスレータ (manual/translator.md)

- **規格**: [manual/translator.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/translator.md)
- **対応状況**: ✅ 設計・フック対応済 (実ファイルハンドリング設計済)

## 実ファイルハンドリング突合結果

- **OnTranslate パイプライン**: SHIORI が出力したさくらスクリプトテキストを受け取り、画面描画・発話直前に動的置換・加工を行う `OnTranslate` イベント処理パイプラインを実装 (`src-tauri/src/commands/shiori/protocol.rs`, `ui/js/ghost/ghost-shiori.js`)。


## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:109` `/// [@manual: manual/translator.md] Translator integration / OnTranslate hook su`
- `ui/js/ghost/sakura-play.js:15` `// [OnTranslate / manual/translator.md]: 発話前のスクリプト動的変換・翻訳処理`
