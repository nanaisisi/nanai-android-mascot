# オーナードローメニュー・背景画像仕様 (Menu Bitmap Specification)

- **規格**: [ukadoc-ssp/functions/explorer/menu](https://ukatech.shillest.net/ukadoc-ssp/) / 伺かシェル仕様 (descript.txt menu.*.bitmap)
- **検索語**: applyShellMenuTheme
- **対応状況**: ✅ 対応済

## 目的

シェル（shell/master/ 等）の `descript.txt` で定義されるメニュー関連の背景ビットマップ（`menu.background.bitmap`）、サイドバービットマップ（`menu.sidebar.bitmap`）、前景ビットマップ（`menu.foreground.bitmap`）、および各種カラー・フォント設定を独立メニュー画面およびCSS上で動的に描画し、SSP オーナードローメニューのビジュアル規格に完全に適合させる。

## 仕様定義 (`descript.txt` menu.* プロパティ)

| プロパティ名                       | 説明                               | CSSカスタムプロパティマッピング |
| ---------------------------------- | ---------------------------------- | ------------------------------- |
| `menu.background.bitmap.filename`  | メニュー全体の背景画像ファイル名   | `--menu-bg-image`               |
| `menu.foreground.bitmap.filename`  | 前景・ハイライト用ビットマップ     | `--menu-fg-image`               |
| `menu.sidebar.bitmap.filename`     | サイドバー領域の縦長画像ファイル名 | `--menu-sidebar-image`          |
| `menu.background.color`            | メニュー背景色 (R,G,B または #HEX) | `--balloon-bg`                  |
| `menu.foreground.color`            | メニュー前景/ホバー色              | `--balloon-highlight-bg`        |
| `font.color` / `menu.*.font.color` | 各種フォントカラー                 | `--balloon-text-color` 等       |

## 実装箇所

- `ui/js/ui/submenu-theme.js:5` `export function applyShellMenuTheme(activeShell) {`
- `ui/js/ui/submenu.js:13` `import { applyShellMenuTheme } from "./submenu-theme.js";`
- `ui/js/ui/submenu.js:102` `applyShellMenuTheme(activeShell);`
