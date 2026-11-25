# 画像ビューワ

- **規格**: [pictureviewer.md](../../../../docs/ukadoc-ssp/functions/pictureviewer.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/pictureviewer/))
- **対応状況**: ⚠️ 一部対応

サーフィスおよび画像アセットのプレビュー・ビューワモーダル機能の実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [対応する画像形式](pictureviewer/section-01.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「対応する画像形式」 |
| [起動方法](pictureviewer/section-02.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「起動方法」 |
| [画面の構成](pictureviewer/section-03.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「画面の構成」 |
| [上部メニュー](pictureviewer/section-04.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「上部メニュー」 |
| [ファイル](pictureviewer/section-05.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「ファイル」 |
| [編集](pictureviewer/section-06.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「編集」 |
| [表示](pictureviewer/section-07.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「表示」 |
| [マウス・キーボード操作](pictureviewer/section-08.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「マウス・キーボード操作」 |
| [各機能の詳細](pictureviewer/section-09.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「各機能の詳細」 |
| [拡大・縮小](pictureviewer/section-10.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「拡大・縮小」 |
| [回転・左右反転](pictureviewer/section-11.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「回転・左右反転」 |
| [背景・透明部分の表示](pictureviewer/section-12.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「背景・透明部分の表示」 |
| [サイズを変更・トリミング](pictureviewer/section-13.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「サイズを変更・トリミング」 |
| [保存・コピー](pictureviewer/section-14.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「保存・コピー」 |
| [自動再読み込み](pictureviewer/section-15.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「自動再読み込み」 |
| [マルチページ・アニメーション](pictureviewer/section-16.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/pictureviewer.md の「マルチページ・アニメーション」 |

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:29` `if (action === "pictureviewer" || action === "archiveviewer") {`
- `ui/ts/ui/submenu-renderer.ts:183` `{ action: "pictureviewer", label: "画像ビューワ", shortcut: "" },`
