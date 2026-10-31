# `balloonp*def*.png` / `balloonp*def*.pna`

- **対応状況**: ✅ 実装済
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

`\p[2]` 以降のキャラクター専用バルーン画像（`balloonp{scopeId}.png` / `.pna`）および、存在しない場合の `balloons0.png` へのフォールバック読込を実装。


## 実装箇所

- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:59` `} else if parts.get(1).is_some_and(|p| *p == "resetballoonpos") {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:61` `args: vec!["execute".to_string(), "resetballoonpos".to_string()],`
- `ui/js/ghost/balloon-window.js:107` `// [balloons*s.txt/balloonk*s.txt/balloonp*]: 背景画像（scope 0: balloons0.png, scope`
- `ui/js/ghost/balloon-window.js:113` `: `balloonp${scopeId}.png`;`
- `ui/js/ghost/balloon-window.js:119` `: `balloonp${scopeId}.pna`;`
