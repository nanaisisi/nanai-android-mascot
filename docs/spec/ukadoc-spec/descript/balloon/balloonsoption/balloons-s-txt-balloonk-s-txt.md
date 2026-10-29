# balloons\*s.txt/balloonk\*s.txt

- **規格**: [balloons-s-txt-balloonk-s-txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/balloons-s-txt-balloonk-s-txt.md)
- **検索語**: balloons
- **対応状況**: ✅ 対応済

## 突合結果

バルーン（ふきだし）オプション群の動的定義および複数スコープ（\0/\1）独立バルーン対応済。


## 実装箇所

- `src-tauri/src/lib.rs:99` `commands::shell::scan_balloons,`
- `src-tauri/src/commands/shell/balloon.rs:13` `pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, S`
- `src-tauri/src/commands/shell/balloon.rs:14` `let mut balloons = Vec::new();`
- `src-tauri/src/commands/shell/balloon.rs:31` `balloons.push(BalloonInfo {`
- `src-tauri/src/commands/shell/balloon.rs:43` `for b in balloons {`
