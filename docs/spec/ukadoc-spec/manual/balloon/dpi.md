# 推奨 DPI 設定 (`dpi`)

- **対応状況**: ✅ 実装済

`dpi` プロパティに基づく高解像度ディスプレイ対応のスケーリング倍率計算（`96 / balloonDpi`）。


## 実装箇所

- `ui/js/core/actions/balloon-theme.js:53` `const dpiScale = this.balloonDpiScale || 1;`
- `ui/js/core/actions/balloon-theme.js:54` `const finalScale = +(userScale * dpiScale).toFixed(4);`
- `ui/js/core/actions/balloon-theme.js:66` `emit("balloon-scale-changed", { userScale, dpiScale, finalScale });`
- `ui/js/core/actions/balloon-theme.js:119` `"--balloon-dpi",`
- `ui/js/core/actions/balloon-theme.js:120` `"--balloon-dpi-scale",`
