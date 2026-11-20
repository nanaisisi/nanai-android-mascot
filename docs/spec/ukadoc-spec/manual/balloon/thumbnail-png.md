# `thumbnail.png` (バルーン)

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: thumbnail.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるバルーン選択時のサムネイル画像 `thumbnail.png`（PNG / JPG / BMP）に対応済み。`scan_balloons` (`src-tauri/src/commands/shell/balloon.rs`) が `read_balloon_thumbnail_from_dir` 経由で `thumbnail.png` / `thumbnail.jpg` / `thumbnail.bmp` を MIME 付き data URL として `BalloonInfo.thumbnail` へ格納し、`get_balloon_thumbnail` (`src-tauri/src/commands/shell/balloon.rs`, `src-tauri/src/invoke.rs`) でもオンデマンド取得できる。`ModalGhostHandlers.renderBalloonList` (`ui/ts/ui/modal-ghost-handlers.ts`) で `BalloonInfo.thumbnail` または `get_balloon_thumbnail` によりサムネイルを表示する。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` `read_balloon_thumbnail_from_dir` / `get_balloon_thumbnail`
- `src-tauri/src/invoke.rs` `commands::shell::get_balloon_thumbnail,`
- `ui/ts/ui/modal-ghost-handlers.ts` `renderBalloonList` (`get_balloon_thumbnail`)
