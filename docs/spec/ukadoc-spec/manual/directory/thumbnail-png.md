# (myghost)/thumbnail.png

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: thumbnail.pnr
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/thumbnail.png`（メニューツリーでゴースト選択時に表示するサムネイル、PNG/JPG および左上 1px 透過用 `.pnr` 形式）は未実装。`GhostInfo`（`src-tauri/src/common/models/ghost.rs`）にサムネイル項目が存在せず、`scan_ghost_directory`（`src-tauri/src/ghost/scan/directory/scan.rs`）および `renderGhostList`（`ui/ts/ui/modal-ghost-handlers.ts`）でもゴーストサムネイルの読み込み・表示を行っていない（`src-tauri/src/commands/shell/balloon.rs` のバルーン用サムネイルとは別経路）。

## 実装箇所

実装コード内に「thumbnail.pnr」は検出されませんでした。
