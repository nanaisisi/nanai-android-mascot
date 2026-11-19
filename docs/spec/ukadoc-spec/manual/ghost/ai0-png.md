# ghost/master/ai0.png / ai0_dark.png

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ai0.png, ai0_dark.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `ai0.png` / `ai0_dark.png`（AI グラフ表示用ロゴ画像）は未実装。`parse_ghost_manifest`（`src-tauri/src/ghost/scan/directory/manifest/parser.rs`）で `descript.txt` の `shiori.logo.file`・`shiori.logo.align`・`shiori.logo.x`・`shiori.logo.y` を取得し、`\![open,aigraph]` / `\![reload,aigraph]` のコマンド分岐（`ui/ts/ghost/command-handler/system/target.ts`）はあるものの、`ai0.png` / `ai0_dark.png` 画像ファイルの探索・読み込み・表示は実装されていない。

## 実装箇所

実装コード内に「ai0.png, ai0_dark.png」は検出されませんでした。

## 実装 (外部ファイル探索)

- `discover_ghost_assets` / `GhostAssets`（`src-tauri/src/ghost/scan/assets.rs`）が `ghost/master/` から thumbnail.png/jpg・ai0.png・ai0_dark.png・*.cur・*.ico を大文字小文字無視で探索し、`GhostInfo.assets` として `scan_ghost_directory` が返す。
- 実在ファイルのみ列挙し、組み込みダミーは持たない。単体テスト: `discovers_assets_from_files`。
- UI 描画（サムネイル表示・カーソル適用）は未着手で、パス提供までを実装済みとする。

