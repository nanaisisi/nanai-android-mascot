# balloon,バルーン名

- **規格**: [balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/balloon.md)
- **検索語**: balloon
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。`ui/js/ghost/ghost.js` (`selectGhost`) にて連動切り替えを行う実装が行われている。

## 実装箇所

- `src-tauri/src/fmo.rs:13` `pub balloon0: String,`
- `src-tauri/src/fmo.rs:14` `pub balloon1: String,`
- `src-tauri/src/fmo.rs:43` `balloon0: "".to_string(),`
- `src-tauri/src/fmo.rs:44` `balloon1: "".to_string(),`
- `src-tauri/src/lib.rs:101` `commands::shell::scan_balloons,`
