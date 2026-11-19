# `thumbnail.png` (バルーン)

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: thumbnail.png
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるバルーン選択時のサムネイル画像 `thumbnail.png`（PNG / JPG 対応、および PNG を `.pnr` にリネームした場合の左上 `(0,0)` ピクセル同色透過）に対し、PNG / JPG / BMP の読み込みとバルーン選択モーダルへの表示は実装済みだが `.pnr` 透過は未実装。`scan_balloons` (`src-tauri/src/commands/shell/balloon.rs:110-125`) が `thumbnail.png` / `thumbnail.jpg` / `thumbnail.bmp` を読み込んで `BalloonInfo.thumbnail` へ格納し、`ModalGhostHandlers.renderBalloonList` (`ui/ts/ui/modal-ghost-handlers.ts:190-217`) でサムネイルを表示する。ただし `.pnr` 拡張子の探索および左上 1 ドット透過処理は未対応であり、`scan_balloons` が `.jpg` / `.bmp` でも一律 `data:image/png;base64,...` の MIME 接頭辞を付与している点に留意が必要。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:110` `let thumbnail = ["thumbnail.png", "thumbnail.jpg", "thumbnail.bmp"]`
- `src-tauri/src/commands/shell/balloon.rs:117` `"data:image/png;base64,{}",`
- `ui/ts/ui/modal-ghost-handlers.ts:190` `renderBalloonList() {`
- `ui/ts/ui/modal-ghost-handlers.ts:213` `const thumbHtml = b.thumbnail`
