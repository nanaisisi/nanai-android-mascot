# balloons\*s.txt/balloonk\*s.txt

- **規格**: [balloons-s-txt-balloonk-s-txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/balloons-s-txt-balloonk-s-txt.md)
- **検索語**: balloons
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` において `scopeId === 0` (さくら / `balloons0.png`) と `scopeId === 1` (kero / `balloonk0.png`) の複数スコープ独立バルーン画像を動的切り替えする実装が行われている。

## 実装箇所

- `ui/js/ghost/balloon-window.js` `const imageFile = scopeId === 0 ? "balloons0.png" : "balloonk0.png";`
- `src-tauri/src/commands/shell/balloon.rs` `pub fn scan_balloons(`
