# アーカイブビューワ

- **規格**: [archiveviewer.md](../../../../docs/ukadoc-ssp/functions/archiveviewer.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/archiveviewer/))
- **対応状況**: ⚠️ 一部対応

VFS 内部ファイル（nar/zip）のプレビューツール（計画中）

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [対応するアーカイブ形式](archiveviewer/section-01.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「対応するアーカイブ形式」 |
| [起動方法](archiveviewer/section-02.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「起動方法」 |
| [画面の構成](archiveviewer/section-03.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「画面の構成」 |
| [上部メニュー](archiveviewer/section-04.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「上部メニュー」 |
| [閲覧・展開](archiveviewer/section-05.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「閲覧・展開」 |
| [アーカイブを作る](archiveviewer/section-06.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「アーカイブを作る」 |
| [選択・表示](archiveviewer/section-07.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「選択・表示」 |
| [マウス・キーボード操作](archiveviewer/section-08.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「マウス・キーボード操作」 |
| [各機能の詳細](archiveviewer/section-09.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「各機能の詳細」 |
| [パスワード付きアーカイブを開く](archiveviewer/section-10.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「パスワード付きアーカイブを開く」 |
| [アーカイブを作る](archiveviewer/section-11.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「アーカイブを作る」 |
| [圧縮時のパスワード設定](archiveviewer/section-12.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「圧縮時のパスワード設定」 |
| [あやしい項目の警告表示](archiveviewer/section-13.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「あやしい項目の警告表示」 |
| [大きなアーカイブの展開](archiveviewer/section-14.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/archiveviewer.md の「大きなアーカイブの展開」 |

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:184` `{ action: "archiveviewer", label: "アーカイブビューワ", shortcut: "" },`
