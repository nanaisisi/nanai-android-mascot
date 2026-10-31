# マウスカーソル設定 (`mousecursor.*`)

- **対応状況**: ✅ 実装済

`mousecursor.arrow`, `mousecursor.text`, `mousecursor.wait` などのバルーン上マウスカーソル定義適用。


## 実装箇所

- `ui/css/balloon-window.css:153` `/* カスタムマウスカーソル (mousecursor.*) */`
- `ui/js/core/actions/balloon-descript/assets.js:60` `// [cursor,ファイル名 / mousecursor,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:62` `// [mousecursor.arrow,ファイル名]:`
- `ui/js/core/actions/balloon-descript/assets.js:63` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`
- `ui/js/core/actions/balloon-descript/assets.js:64` `// [mousecursor.text,ファイル名]:`
