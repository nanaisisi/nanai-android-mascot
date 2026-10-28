# オーナードローメニュー・背景画像仕様 (Menu Bitmap Specification)

- **規格**: [ukadoc-ssp/functions/explorer/menu](https://ukatech.shillest.net/ukadoc-ssp/) / 伺かシェル仕様 (descript.txt menu.*.bitmap)
- **対応状況**: ✅ 対応済

## 目的

シェル（shell/master/ 等）の `descript.txt` で定義されるメニュー関連の背景ビットマップ（`menu.background.bitmap`）、サイドバービットマップ（`menu.sidebar.bitmap`）、前景ビットマップ（`menu.foreground.bitmap`）、および各種カラー・フォント設定を独立メニュー画面（`menu-iframe.html` / `submenu.js`）およびCSS上で動的に描画し、SSP オーナードローメニューのビジュアル規格に完全に適合させる。

## 仕様定義 (`descript.txt` menu.* プロパティ)

| プロパティ名                       | 説明                               | CSSカスタムプロパティマッピング |
| ---------------------------------- | ---------------------------------- | ------------------------------- |
| `menu.background.bitmap.filename`  | メニュー全体の背景画像ファイル名   | `--menu-bg-image`               |
| `menu.foreground.bitmap.filename`  | 前景・ハイライト用ビットマップ     | `--menu-fg-image`               |
| `menu.sidebar.bitmap.filename`     | サイドバー領域の縦長画像ファイル名 | `--menu-sidebar-image`          |
| `menu.background.color`            | メニュー背景色 (R,G,B または #HEX) | `--balloon-bg`                  |
| `menu.foreground.color`            | メニュー前景/ホバー色              | `--balloon-highlight-bg`        |
| `font.color` / `menu.*.font.color` | 各種フォントカラー                 | `--balloon-text-color` 等       |

## レンダリング規則

1. **パス解決**: シェルディレクトリの絶対パスとビットマップファイル名を結合し、Tauri の `convertFileSrc` を通じてブラウザセーフなローカルアセットURLに変換する。
2. **サイドバー描画**: `menu.sidebar.bitmap` が指定されている場合、メニュー本体の左側にサイドバー領域を展開し (`.has-sidebar`)、背景画像をタイルまたはリピート描画する。
3. **フォールバック**: ビットマップが未指定の場合は、テーマカラー（アイボリー、ダーク、コミック、ピクセル等）によるモダンCSSスタイルに自動フォールバックする。
