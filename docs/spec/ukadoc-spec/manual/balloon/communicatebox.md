# コミュニケートボックス設定 (`communicatebox.*`)

- **対応状況**: ✅ 実装済

`communicatebox.x`, `communicatebox.y`, `communicatebox.width`, `communicatebox.height`, `communicatebox.font.*` などのコミュニケート入力欄設定。


## 実装箇所

- `ui/css/balloon-window.css:136` `/* コミュニケートボックス (communicatebox.*) */`
- `ui/js/core/actions/balloon-descript/layout.js:27` `// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標`
- `ui/js/core/actions/balloon-descript/layout.js:28` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/js/core/actions/balloon-descript/layout.js:29` `const cbWidth = props["communicatebox.width"];`
- `ui/js/core/actions/balloon-descript/layout.js:30` `const cbHeight = props["communicatebox.height"];`
