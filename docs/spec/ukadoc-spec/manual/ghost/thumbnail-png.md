# ghost/master/thumbnail.png

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ghost/master/thumbnail.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `thumbnail.png`（メニューツリーでゴースト選択時に表示されるサムネイル、PNG/JPG および左上 1px 透過用 `.pnr`）は未実装。`GhostInfo`（`src-tauri/src/common/models/ghost.rs`）にサムネイル項目が存在せず、`scan_ghost_directory`（`src-tauri/src/ghost/scan/directory/scan.rs`）および `renderGhostList`（`ui/ts/ui/modal-ghost-handlers.ts`）でも `ghost/master/thumbnail.png` / `.jpg` / `.pnr` の読み込み・描画を行っていない。

## 実装箇所

実装コード内に「ghost/master/thumbnail.png」は検出されませんでした。

## 実装 (外部ファイル探索)

- `discover_ghost_assets` / `GhostAssets`（`src-tauri/src/ghost/scan/assets.rs`）が `ghost/master/` から thumbnail.png/jpg・ai0.png・ai0_dark.png・_.cur・_.ico を大文字小文字無視で探索し、`GhostInfo.assets` として `scan_ghost_directory` が返す。
- 実在ファイルのみ列挙し、組み込みダミーは持たない。単体テスト: `discovers_assets_from_files`。
- UI 側では `GhostInfo.assets`（`ui/ts/ghost/ghost.ts`）として型定義され、`renderGhostList`（`ui/ts/ui/modal-ghost-handlers.ts`）で `thumbnail`（フォールバックとして `ai0` / `icons[0]`）を `convertFileSrc` 経由でサムネイル表示する。
