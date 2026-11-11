# balloons\*s.txt/balloonk\*s.txt

- **規格**: [balloons-s-txt-balloonk-s-txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/balloons-s-txt-balloonk-s-txt.md)
- **検索語**: balloons
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` において `scopeId === 0` (さくら / `balloons0.png`) と `scopeId === 1` (kero / `balloonk0.png`) の複数スコープ独立バルーン画像を動的切り替えする実装が行われている。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:16` `let mut balloons = Vec::new();`
- `src-tauri/src/commands/shell/balloon.rs:63` `balloons.push(BalloonInfo {`
- `src-tauri/src/commands/shell/balloon.rs:77` `for b in balloons {`
- `src-tauri/src/commands/shell/balloon.rs:112` `let prefix = if sid == 1 { "balloonk" } else { "balloons" };`
- `ui/ts/core/actions/balloon-theme.ts:177` `const balloons = await invoke("scan_balloons");`
