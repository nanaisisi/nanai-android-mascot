# balloons\*s.txt/balloonk\*s.txt

- **規格**: [balloons-s-txt-balloonk-s-txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/balloons-s-txt-balloonk-s-txt.md)
- **検索語**: balloons
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` において `scopeId === 0` (さくら / `balloons0.png`) と `scopeId === 1` (kero / `balloonk0.png`) の複数スコープ独立バルーン画像を動的切り替えする実装が行われている。

## 実装箇所

- `src-tauri/src/lib.rs:101` `commands::shell::scan_balloons,`
- `src-tauri/src/commands/shell/balloon.rs:15` `pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, S`
- `src-tauri/src/commands/shell/balloon.rs:16` `let mut balloons = Vec::new();`
- `src-tauri/src/commands/shell/balloon.rs:62` `balloons.push(BalloonInfo {`
- `src-tauri/src/commands/shell/balloon.rs:76` `for b in balloons {`
