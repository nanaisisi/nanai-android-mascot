# recommended.balloon,バルーン名

- **規格**: [recommended.balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.md)
- **検索語**: recommended.balloon
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `recommended.balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。`ui/js/ghost/ghost.js` (`selectGhost`) にて連動切り替えを行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:295` `// [balloon,バルーン名], [recommended.balloon,バルーン名]:`
- `src-tauri/src/commands/install/archive.rs:298` `.and_then(|m| m.get("recommended.balloon").cloned().or_else(|| m.get("balloon").`
- `src-tauri/src/commands/install/archive.rs:301` `.and_then(|m| m.get("recommended.balloon.path").cloned());`
- `src-tauri/src/common/models.rs:44` `/// [balloon,バルーン名], [recommended.balloon,バルーン名]:`
- `src-tauri/src/common/models.rs:46` `/// [標準と推奨の使い分け], [recommended.balloon.path,パス]:`
