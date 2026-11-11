# balloon,バルーン名

- **規格**: [balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/balloon.md)
- **検索語**: balloon
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。`ui/js/ghost/ghost.js` (`selectGhost`) にて連動切り替えを行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:97` `.map_err(|e| format!("Failed to inspect balloon directory: {e}"))?`
- `src-tauri/src/commands/install/utils.rs:102` `let wrapper = if target_dir.join("balloon").is_dir() {`
- `src-tauri/src/commands/install/utils.rs:103` `Some(target_dir.join("balloon"))`
- `src-tauri/src/commands/install/utils.rs:115` `.map_err(|e| format!("Failed to inspect balloon wrapper: {e}"))?`
- `src-tauri/src/commands/install/utils.rs:123` `.ok_or_else(|| "Invalid balloon archive entry".to_string())?,`
