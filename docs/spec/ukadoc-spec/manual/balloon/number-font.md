# 数値フォント設定 (`number.font.*`)

- **対応状況**: ✅ 実装済

`number.font.name`, `number.font.height`, `number.font.color` などの数値表示専用フォント設定適用。


## 実装箇所

- `ui/js/core/actions/balloon-descript/font/special.js:18` `"--balloon-number-font-family",`
- `ui/js/core/actions/balloon-descript/font/special.js:24` `root.style.setProperty("--balloon-number-font-size", `${numFontHeight}px`);`
