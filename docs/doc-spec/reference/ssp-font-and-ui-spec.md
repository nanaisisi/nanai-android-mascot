# SSP 暗黙仕様: フォントサイズ・96 DPI 換算・インライン要素サイズフィット規格定義

本ドキュメントは、SSP (Software Space Pilot / 伺かベースウェア) におけるバルーンテキスト・オーナードローメニューのフォントサイズ定義、単位換算（pt ↔ px）、選択肢ボタンおよびインライン画像（`\_b[...]`）のサイズフィット互換挙動を当プロジェクト（Nanai Android Mascot）の正式仕様として明文化・根拠付けするものである。

---

## 1. 概要および数理的根拠

伺か（Materia / CROW / SSP）におけるフォントサイズ指定は、Windows GDI の `LOGFONT` 構造体 (`lfHeight`) および標準的な 96 DPI 画面ディスプレイ（100% スケーリング）の単位系に由来する。

### 単位換算公式
1 インチ ＝ 72 ポイント (pt) ＝ 96 ピクセル (px)（96 DPI 環境）

$$\text{ピクセルサイズ (px)} = \text{round}\left( \text{ポイントサイズ (pt)} \times \frac{96}{72} \right) = \text{round}\left( \text{pt} \times \frac{4}{3} \right)$$

### 9pt と 12px の等価性
SSP の標準フォントサイズである **`9pt`** を 96 DPI 換算式に適用すると：

$$9 \text{ pt} \times \frac{96}{72} = 12 \text{ px}$$

となり、UKADOC 規格 (`descript/balloon/descript-txt/font.height.md`) の既定値 **`font.height,12`** に完全一致する。

---

## 2. バルーンフォントサイズの評価優先順位ルール

バルーン定義ファイル（`balloons*s.txt` / `balloonk*s.txt` / `descript.txt`）のパース時において、フォントサイズは以下の優先度に従ってCSS変数 `--balloon-font-size` へ展開される：

1. **`font.height,数値`** (最優先):
   - 単位: **ピクセル (px)**
   - 例: `font.height,14` $\to$ `14px`

2. **`font.size,数値`** (第2優先):
   - 単位: **ポイント (pt)**
   - 例: `font.size,9` $\to$ $\text{round}(9 \times 96 / 72) = 12\text{px}$
   - 例: `font.size,12` $\to$ $\text{round}(12 \times 96 / 72) = 16\text{px}$

3. **既定値フォールバック** (最小優先度):
   - プロパティ未指定時: SSP 暗黙規格である **`12px`** (9pt 相当) を適用。

---

## 3. 関連UI要素への展開・応用

| プロパティ / 命令 | 単位 | 既定値 | 換算・適用ルール |
| :--- | :--- | :--- | :--- |
| **`font.height` / `font.size`** | px / pt | `12px` (9pt) | バルーン内文面の基本フォントサイズ (`--balloon-font-size`) |
| **`menu.font.size` / `menu.font.height`** | pt / px | `12px` (9pt) | オーナードロー右クリックメニューの項目フォントサイズ |
| **`number.font.height`** | px | `10px` | バルーン数値表示専用フォントサイズ (`--balloon-number-font-size`) |
| **`sstpmessage.font.height`** | px | `7px` | SSTP メッセージ表示領域用フォントサイズ (`--balloon-sstp-font-size`) |
| **`\f[height,N]` (さくらスクリプト)** | px | `12px` | 発話中の動的フォントサイズ切り替え (絶対指定 / 相対指定 `+2`, `-2` / `default`) |

---

## 4. インライン選択肢ボタンおよびインライン画像の完全サイズフィット仕様

SSP 互換レイアウトを完全再現するため、バルーン内選択肢ボタンおよびインライン画像（`\_b[...]`）の描画サイズはテキスト行のサイズへ完全インラインフィットされる：

1. **インライン画像 (`\_b[path,mode,x,y,opaque]`)**:
   - `mode` が `inline` または未指定の場合、テキスト流し込み（`display: inline-block`）へ配置。
   - 高さ (`max-height`): 現在のテキスト行高に完全合致 (`1.2em`)。
   - 垂直配置 (`vertical-align`): `middle` に揃えて文面と高さを均一化。

2. **バルーン選択肢ボタン (`balloon-choice-btn` / `ssp-buttons`)**:
   - バルーンフォントサイズ (`--balloon-font-size`) および行高 (`line-height: 1.2`) へ完全追従。
   - `display: inline-block`, `vertical-align: middle` により文面流し込みのレイアウト崩れを防止。

---

## 5. アプリケーションコードでの実装箇所

- **フロントエンド（CSS変数展開）**:
  `../../../ui/js/core/actions/balloon-descript/font/base.js` (`applyBaseFontProperties`)
- **特殊・数値フォント設定**:
  `../../../ui/js/core/actions/balloon-descript/font/special.js` (`applySpecialFontProperties`)
- **インライン画像描画・ボタン配置**:
  `../../../ui/js/ghost/sakura-play/handlers.js` (`inline_bitmap`)
- **さくらスクリプト動的サイズ変更**:
  `crates/ui/src/script/parser/brackets/handlers/font.rs` / `../../../ui/js/ghost/sakura-play/handlers.js`
