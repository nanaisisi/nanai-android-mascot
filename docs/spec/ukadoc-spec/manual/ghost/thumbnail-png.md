# ghost/master/thumbnail.png

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ghost/master/thumbnail.png
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `thumbnail.png`（メニューツリーでゴースト選択時に表示されるサムネイル、PNG/JPG および左上 1px 透過用 `.pnr`）は未実装。`GhostInfo`（`src-tauri/src/common/models/ghost.rs`）にサムネイル項目が存在せず、`scan_ghost_directory`（`src-tauri/src/ghost/scan/directory/scan.rs`）および `renderGhostList`（`ui/ts/ui/modal-ghost-handlers.ts`）でも `ghost/master/thumbnail.png` / `.jpg` / `.pnr` の読み込み・描画を行っていない。

## 実装箇所

実装コード内に「ghost/master/thumbnail.png」は検出されませんでした。
