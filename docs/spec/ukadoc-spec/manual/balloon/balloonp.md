# `balloonp*def*.png` / `balloonp*def*.pna`

- **対応状況**: ✅ 実装済

`\p[2]` 以降のキャラクター専用バルーン画像（`balloonp{scopeId}.png` / `.pna`）および、存在しない場合の `balloons0.png` へのフォールバック読込を実装。


## 実装箇所

- `ui/js/ghost/balloon-window.js:131` `// [balloons*s.txt/balloonk*s.txt/balloonp*]: 背景画像（scope 0: balloons0.png, scope`
- `ui/js/ghost/balloon-window.js:137` `: `balloonp${scopeId}.png`;`
- `ui/js/ghost/balloon-window.js:143` `: `balloonp${scopeId}.pna`;`
