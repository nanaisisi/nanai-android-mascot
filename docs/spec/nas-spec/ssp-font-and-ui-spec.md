# SSP 暗黙仕様: フォントサイズ・96 DPI 換算・インライン要素サイズフィット規格定義

- **規格**: [Nanai Mascot Font Spec](ssp-font-and-ui-spec.md)
- **検索語**: applyBaseFontProperties
- **対応状況**: ✅ 対応済

本ドキュメントは、SSP におけるバルーンテキスト・オーナードローメニューのフォントサイズ定義、単位換算（pt ↔ px）、選択肢ボタンおよびインライン画像（`\_b[...]`）のサイズフィット互換挙動を定義する。

---

## 1. 概要および数理的根拠
$1\text{in} = 72\text{pt} = 96\text{px} \implies \text{px} = \text{round}(\text{pt} \times 96 / 72)$.
$9\text{pt} \times 96 / 72 = 12\text{px}$.

---

## 2. 評価優先順位
1. `font.height` (px)
2. `font.size` (pt $\to$ px)
3. デフォルト `12px`

---

## 3. インライン要素サイズフィット
- `balloon-choice-btn`: `font-size: 1em`, `line-height: 1.2`, `padding: 0.25em 0.6em`
- `balloon-inline-bitmap`: `max-height: 1.2em`, `vertical-align: middle`

---

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:5` `import { applyBaseFontProperties } from "./font/base.js";`
- `ui/js/core/actions/balloon-descript/font.js:10` `applyBaseFontProperties(root, props);`
- `ui/js/core/actions/balloon-descript/font/base.js:3` `export function applyBaseFontProperties(root, props) {`
