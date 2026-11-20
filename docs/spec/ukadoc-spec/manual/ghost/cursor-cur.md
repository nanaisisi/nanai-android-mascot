# ghost/master/*.cur

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ghost/master/*.cur
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `*.cur`（ゴースト上にカーソルが乗った際に表示されるカーソルファイル）は未実装。バルーン側の `descript.txt` `mousecursor` プロパティを CSS `cursor` へ反映する経路（`ui/ts/core/actions/balloon-descript/assets.ts`）とは異なり、`ghost/master/` 配下の `*.cur` 読み込みやキャラクターホバー時のカーソル切替処理は実装されていない。

## 実装箇所

実装コード内に「ghost/master/*.cur」は検出されませんでした。

## 実装 (外部ファイル探索)

- `discover_ghost_assets` / `GhostAssets`（`src-tauri/src/ghost/scan/assets.rs`）が `ghost/master/` から thumbnail.png/jpg・ai0.png・ai0_dark.png・*.cur・*.ico を大文字小文字無視で探索し、`GhostInfo.assets` として `scan_ghost_directory` が返す。
- 実在ファイルのみ列挙し、組み込みダミーは持たない。単体テスト: `discovers_assets_from_files`。
- UI 描画: `ghostSurfaceMethods.applyGhostCursor`（`ui/ts/surface/ghost-surface.ts`）が `GhostController.setGhost`（`ui/ts/ghost/ghost.ts`）から呼び出され、`GhostAssets.cursors` の先頭ファイルを `convertFileSrc` 経由で `.character-slot` の CSS `cursor` に適用する。

