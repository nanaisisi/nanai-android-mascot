# テキスト折り返し位置 (`wordwrappoint.x`)

- **対応状況**: ✅ 実装済

`wordwrappoint.x` によるバルーンの最大幅およびテキスト折り返し位置の動的調整。


## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:104` `// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:`
- `ui/js/core/actions/balloon-descript/layout.js:105` `if (props["wordwrappoint.x"]) {`
- `ui/js/core/actions/balloon-descript/layout.js:106` `const ww = parseInt(props["wordwrappoint.x"], 10);`
- `ui/js/core/actions/balloon-descript/layout.js:115` `const wwY = parseInt(props["wordwrappoint.y"], 10);`
- `ui/js/ghost/balloon-window.js:98` `// 折り返し幅 (wordwrappoint.x は原点右基準の負オフセット指定)`
