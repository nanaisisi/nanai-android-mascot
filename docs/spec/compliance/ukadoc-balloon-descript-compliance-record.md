# UKADOC Balloon `descript.txt` 仕様準拠実装記録

## 概要

UKADOC (SSP仕様) 準拠のバルーン `descript.txt` プロパティ群のフロントエンド・CSSバインディングおよび評価ロジックの実装状況および検証結果を本記録文書へ集約・記録する。

---

## 📋 実装プロパティ一覧および CSS 変数マッピング

### 1. フォント・カラー・スタイル (`font.*` / `disable.font`)

| `descript.txt` キー              | 設定機能                               | 反映先 CSS 変数 / 内部プロパティ | 状態      |
| :------------------------------- | :------------------------------------- | :------------------------------- | :-------- |
| `font.name`                      | 基本フォントファミリー名               | `--balloon-font-family`          | ✅ 実装済 |
| `font.height`                    | フォントサイズ (px)                    | `--balloon-font-size`            | ✅ 実装済 |
| `font.color.r/g/b`, `font.color` | 基本テキスト色                         | `--balloon-text-color`           | ✅ 実装済 |
| `font.shadowcolor.r/g/b`         | ドロップシャドウ色                     | `--balloon-font-shadow-color`    | ✅ 実装済 |
| `font.shadowstyle`               | 影スタイル (`offset`/`outline`/`none`) | `--balloon-font-shadow-style`    | ✅ 実装済 |
| `font.bold`                      | 太字フラグ (`0`/`1`/`true`)            | `--balloon-font-weight`          | ✅ 実装済 |
| `font.italic`                    | 斜体フラグ (`0`/`1`/`true`)            | `--balloon-font-style`           | ✅ 実装済 |
| `font.underline`                 | 下線フラグ (`0`/`1`/`true`)            | `--balloon-text-decoration`      | ✅ 実装済 |
| `font.strike`                    | 打ち消し線フラグ (`0`/`1`/`true`)      | `--balloon-text-decoration`      | ✅ 実装済 |
| `font.outline`                   | 外枠線フラグ (`0`/`1`/`true`)          | `--balloon-font-outline`         | ✅ 実装済 |
| `disable.font`                   | 特定箇所のフォント変更無効化           | `--balloon-disable-font`         | ✅ 実装済 |

---

### 2. アンカー (`anchor.*` / `anchor.visited.*` / `anchor.notselect.*`)

| `descript.txt` キー                                                                                                 | 設定機能                                   | 反映先 CSS 変数                                                                                                     | 状態      |
| :------------------------------------------------------------------------------------------------------------------ | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :-------- |
| `anchor.style`, `anchor.visited.style`, `anchor.notselect.style`                                                    | アンカー形状 (`underline`/`square`/`none`) | `--balloon-anchor-style`, `--balloon-anchor-visited-style`, `--balloon-anchor-notselect-style`                      | ✅ 実装済 |
| `anchor.font.color.r/g/b`, `anchor.visited.font.color.r/g/b`, `anchor.notselect.font.color.r/g/b`                   | アンカー文字色                             | `--balloon-anchor-color`, `--balloon-anchor-visited-color`, `--balloon-anchor-notselect-color`                      | ✅ 実装済 |
| `anchor.font.shadowcolor.r/g/b`, `anchor.visited.font.shadowcolor.r/g/b`, `anchor.notselect.font.shadowcolor.r/g/b` | アンカー影色                               | `--balloon-anchor-shadow-color`, `--balloon-anchor-visited-shadow-color`, `--balloon-anchor-notselect-shadow-color` | ✅ 実装済 |
| `anchor.pen.color.r/g/b`, `anchor.visited.pen.color.r/g/b`, `anchor.notselect.pen.color.r/g/b`                      | 枠線ペン色                                 | `--balloon-anchor-pen-color`, `--balloon-anchor-visited-pen-color`, `--balloon-anchor-notselect-pen-color`          | ✅ 実装済 |
| `anchor.brush.color.r/g/b`, `anchor.visited.brush.color.r/g/b`, `anchor.notselect.brush.color.r/g/b`                | 塗りつぶしブラシ色                         | `--balloon-anchor-brush-color`, `--balloon-anchor-visited-brush-color`, `--balloon-anchor-notselect-brush-color`    | ✅ 実装済 |

---

### 3. 選択肢カーソル (`cursor.*` / `cursor.notselect.*`)

| `descript.txt` キー                                  | 設定機能                                   | 反映先 CSS 変数                                              | 状態      |
| :--------------------------------------------------- | :----------------------------------------- | :----------------------------------------------------------- | :-------- |
| `cursor.style`, `cursor.notselect.style`             | マーカー形状 (`square`/`underline`/`none`) | `--balloon-cursor-style`, `--balloon-cursor-notselect-style` | ✅ 実装済 |
| `cursor.font.color.r/g/b`                            | 選択肢背景/ハイライト色                    | `--balloon-highlight-bg`                                     | ✅ 実装済 |
| `cursor.color.font`                                  | 選択肢文字色                               | `--balloon-highlight-text`                                   | ✅ 実装済 |
| `cursor.font.shadowcolor.r/g/b`                      | 選択肢影色                                 | `--balloon-cursor-shadow-color`                              | ✅ 実装済 |
| `cursor.pen.color.r/g/b`, `cursor.brush.color.r/g/b` | 枠線・塗りつぶし色                         | `--balloon-cursor-pen-color`, `--balloon-cursor-brush-color` | ✅ 実装済 |

---

### 4. レイアウト・領域・座標 (`validrect.*` / `wordwrappoint.*` / `origin.*` / `windowposition.*`)

| `descript.txt` キー                 | 設定機能                           | 反映先 CSS 変数 / スタイル                       | 状態      |
| :---------------------------------- | :--------------------------------- | :----------------------------------------------- | :-------- |
| `dpi`                               | 推奨 DPI (規定 96)                 | `--balloon-dpi`, `--balloon-dpi-scale`           | ✅ 実装済 |
| `validrect.left/top/right/bottom`   | 有効表示テキスト領域パディング     | `padding: top right bottom left`                 | ✅ 実装済 |
| `wordwrappoint.x / y`               | 折返し幅 / 最大高さ                | `maxWidth`, `maxHeight`                          | ✅ 実装済 |
| `origin.x / y`                      | 表示原点オフセット                 | `balloonDisplay.style.left / top`                | ✅ 実装済 |
| `number.x / y / xr / yb`            | 数字パーツ座標                     | `--balloon-number-x/y/xr/yb`                     | ✅ 実装済 |
| `number.font.name / height / color` | 数字用フォント・サイズ・色         | `--balloon-number-font-family/font-size/color`   | ✅ 実装済 |
| `sstpmarker.x / y`                  | SSTPマーカー表示位置               | `--balloon-sstpmarker-x/y`                       | ✅ 実装済 |
| `sstpmessage.x / y / xr / yb`       | SSTPメッセージ位置                 | `--balloon-sstpmessage-x/y/xr/yb`                | ✅ 実装済 |
| `windowposition.x / y / limit`      | ウィンドウ初期位置および画面外制限 | `--balloon-windowpos-x/y`, `windowPositionLimit` | ✅ 実装済 |

---

### 5. 画像アセット・マウスカーソル (`*.filename` / `mousecursor.*` / `vertical`)

| `descript.txt` キー                                  | 設定機能                           | 反映先 CSS 変数 / プロパティ                                             | 状態      |
| :--------------------------------------------------- | :--------------------------------- | :----------------------------------------------------------------------- | :-------- |
| `arrow.filename`, `arrow0.x/y`, `arrow1.x/y`         | 吹き出し矢印画像および座標         | `--balloon-arrow-image`, `--balloon-arrow0-x/y`, `--balloon-arrow1-x/y`  | ✅ 実装済 |
| `clickwaitmarker.filename`, `clickwaitmarker.x/y`    | クリック待ちマーカー画像・位置     | `--balloon-clickwait-image`, `--balloon-clickwait-x/y`                   | ✅ 実装済 |
| `marker.filename`                                    | 一般マーカー画像                   | `--balloon-marker-image`                                                 | ✅ 実装済 |
| `onlinemarker.filename`, `onlinemarker.x/y/interval` | オンラインマーカー画像・位置・点滅 | `--balloon-online-image`, `--balloon-online-x/y`, `onlineMarkerInterval` | ✅ 実装済 |
| `mousecursor.arrow / text / wait`                    | マウスカーソル画像                 | `--balloon-cursor-arrow/text/wait`                                       | ✅ 実装済 |
| `vertical`                                           | 縦書きモード (`0`/`1`/`true`)      | `--balloon-writing-mode: vertical-rl`                                    | ✅ 実装済 |
| `paint_transparent_region_black`                     | 透過領域の黒塗り制御               | `--balloon-paint-black`                                                  | ✅ 実装済 |
| `use_self_alpha`, `use_input_alpha`                  | アルファチャンネル適用制御         | `--balloon-use-self-alpha/use-input-alpha`                               | ✅ 実装済 |
| `overlay_outside_balloon`                            | バルーン外へのオーバーレイ描画     | `--balloon-overlay-outside`                                              | ✅ 実装済 |

---

## 6. ソースコードコメント参照規定 (Code Comment Annotation Rule)

[厳密コード検証システム規定 (Strict Code Verification Protocol)](../../developer/strict-code-verification-system.md) に基づき、[index.md](../ukadoc-spec/descript/balloon/descript-txt/index.md) の全 163 仕様項目タイトルは、ソースコード ([balloon.rs](../../../src-tauri/src/commands/shell/balloon.rs), [font.js](../../../ui/js/core/actions/balloon-descript/font.js), [layout.js](../../../ui/js/core/actions/balloon-descript/layout.js), [assets.js](../../../ui/js/core/actions/balloon-descript/assets.js), [balloon-window.js](../../../ui/js/ghost/balloon-window.js)) 内に **「`// [項目名,タイトル]: ...`」** 形式のコードコメントとして 1 回以上明確にアノテーションされている。

---

## 🧪 単体テスト検証

すべてのプロパティ設定と CSS 変数バインディングは、[tests/balloon-descript.test.js](../../../tests/balloon-descript.test.js) および [tests/balloon-window.test.js](../../../tests/balloon-window.test.js) により全件検証され、PASS（成功）している。
