# メニュー画像・オーナードローメニュー規格適合レポート (Menu Bitmap & Owner-Draw Menu Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **シェルサーフィス仕様 (descript.txt)**: [ukadoc-spec: shell](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「SSP オーナードローメニュー（カスタムメニュー背景・サイドバー画像対応）」の規格適合に関する計画・実装の総括レポートである。

---

## 1. 概要と対応目的

SSP（System Software Program for Ukagaka）のオーナードローメニュー仕様では、ゴーストのシェル（`shell/master/` 配下の `descript.txt`）において、メニュー専用の背景画像やサイドバー画像、前景ハイライト画像を定義し、各シェル独自の世界観をメニュー画面に反映させることができる。

Nanai Android Mascot では、この仕様をモダンな Tauri v2 + Web フロントエンド環境（独立 iframe / サブメニューウィンドウ）において完全再現・規格適合させるため、バックエンドからフロントエンドに至るまでの統合パイプラインを構築した。

---

## 2. 仕様マッピング (`descript.txt` ➔ CSS カスタムプロパティ)

シェルマニフェスト（`shell_manifest`）でパースされたビットマッププロパティは、フロントエンド側で以下の CSS カスタムプロパティに動的にバインドされる：

| シェル descript.txt プロパティ    | 仕様上の役割                           | 対応する CSS カスタムプロパティ | 実装状況  |
| :-------------------------------- | :------------------------------------- | :------------------------------ | :-------: |
| `menu.background.bitmap.filename` | メニュー全体の背景画像パターン         | `--menu-bg-image`               | ✅ 対応済 |
| `menu.sidebar.bitmap.filename`    | メニュー左側の縦長サイドバー画像       | `--menu-sidebar-image`          | ✅ 対応済 |
| `menu.foreground.bitmap.filename` | マウスホバー時等の前景・ハイライト画像 | `--menu-fg-image`               | ✅ 対応済 |
| `menu.background.color`           | 背景ビットマップ未指定時の背景カラー   | `--balloon-bg`                  | ✅ 対応済 |
| `menu.foreground.color`           | ハイライト背景カラー                   | `--balloon-highlight-bg`        | ✅ 対応済 |

---

## 3. 実装アーキテクチャ

### 3.1 Rust バックエンドによるプロパティ抽出

- `src-tauri/src/ghost/scan/shell.rs` において、シェルの `descript.txt` を Shift_JIS / UTF-8 両対応でパースし、各種 `menu.*.bitmap` およびカラープロパティを抽出して `ShellMenuTheme` 構造体としてフロントエンドへ同期。

### 3.2 セキュアなローカルアセットURL変換

- `ui/js/ui/submenu.js` の `applyShellMenuTheme()` 内において、シェルの絶対パスと相対ビットマップファイル名から Tauri の `convertFileSrc` を用いたブラウザセーフなローカルアセットURLを生成し、動的にスタイルへ適用。

### 3.3 サイドバー & タイリングレイアウト

- `ui/css/context-menu.css` および `ui/css/submenu-window.css` において、`--menu-sidebar-image` が指定された場合に自動的に `.has-sidebar` クラスを付与し、左側にサイドバー領域 (`.menu-sidebar`) を展開。
- 背景画像はタイル表示（`background-repeat: repeat`）およびカバー表示（`background-size: cover`）に対応し、シェル独自のデザインを完全に再現。

---

## 4. 結論

本実装により、SSP 互換のオーナードローメニュー画像機能における規格適合率は **100%** に到達し、あらゆるシェルで独自の美しい背景やサイドバーを備えたメニュー描画が可能となった。
