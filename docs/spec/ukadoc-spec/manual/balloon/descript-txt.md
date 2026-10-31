# `descript.txt`

- **対応状況**: ✅ 実装済
- **規格**: [descript/balloon](../../descript/balloon)
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`balloon_manifest`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js) (`applyBalloonDescript`)
  - [font.js](../../../../ui/js/core/actions/balloon-descript/font.js) (`applyFontProperties`)

`balloon_manifest` および `applyFontProperties` を通じて、バルーンの `descript.txt` に定義されたフォントファミリー、高さ、太字・斜体などの装飾、色、影、アンカー属性、カーソル属性、有効矩形 (`validrect.*`)、折り返し (`wordwrappoint.x`) などの全プロパティを独立バルーンへ完全反映。
