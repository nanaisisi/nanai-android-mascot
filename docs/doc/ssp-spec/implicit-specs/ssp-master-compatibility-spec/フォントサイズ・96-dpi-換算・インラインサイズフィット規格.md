# 1. フォントサイズ・96 DPI 換算・インラインサイズフィット規格

### 1.1 数理的換算根拠

伺か（Materia / CROW / SSP）におけるフォントサイズ指定は、Windows GDI（96 DPI 標準、1 インチ ＝ 72 pt ＝ 96 px）を基準とする。

$$\text{ピクセルサイズ (px)} = \text{round}\left( \text{ポイントサイズ (pt)} \times \frac{96}{72} \right) = \text{round}\left( \text{pt} \times \frac{4}{3} \right)$$

SSP の標準フォントサイズである **`9pt`** を換算すると：
$$9 \text{ pt} \times \frac{96}{72} = 12 \text{ px}$$
となり、UKADOC 規格 (`font.height,12`) の既定値 **`12px`** に完全一致する。

### 1.2 バルーンフォント評価優先順位

1. **`font.height,数値`** (最優先): ピクセル単位 (`px`)。例: `font.height,14` $\to$ `14px`
2. **`font.size,数値`** (第2優先): ポイント単位 (`pt`)。$\text{pt} \times \frac{96}{72}$ で px に換算。
3. **既定値フォールバック** (最小優先度): 未指定時は **`12px`** (9pt 相当)。

### 1.3 UI・インライン要素の文字サイズ追従ルール

- **バルーン選択肢ボタン (`.balloon-choice-btn`)**: `font-size: 1em;`, `line-height: 1.2;`, `padding: 0.25em 0.6em;` を適用。文面のフォントサイズ変更（`\f[height,N]` 等）に比例して動的にサイズ変化する。
- **インライン画像 (`\_b[...]`)**: `display: inline-block;`, `vertical-align: middle;`, `max-height: 1.2em;` を適用。文面の行高へ自動フィットする。

---
