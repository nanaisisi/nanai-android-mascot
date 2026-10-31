# `thumbnail.png`

- **対応状況**: ❌ 未実装
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`scan_balloons` での `thumbnail.png` / `.jpg` / `.bmp` 読込)

導入物内の `thumbnail.png`, `thumbnail.jpg`, `thumbnail.bmp` は `scan_balloons` コマンドにより Base64 データ URL としてロードされ、バルーン選択画面等での表示に対応。
