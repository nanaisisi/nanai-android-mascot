# terms.txt または terms.md

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: terms.txt, terms.md
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/terms.txt` または `terms.md`（NAR/ZIP インストール前に利用条件を表示しインストールを中断して確認するダイアログ仕様）は未実装。アーカイブ展開処理 `extract_ghost_archive_from_reader`（`src-tauri/src/commands/install/archive/mod.rs`）は `terms.txt` / `terms.md` の読込や事前同意ダイアログ表示を行わない。なお SHIORI 通知側には `OnGhostTermsAccept` / `OnGhostTermsDecline`（`ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts`）および `type === "terms"` ダイアログ描画枠（`ui/ts/ui/renderers/modal-dialog-system.ts`）があるが、パッケージ内 `terms.txt` / `terms.md` とは接続されていない。

## 実装箇所

実装コード内に「terms.txt, terms.md」は検出されませんでした。
