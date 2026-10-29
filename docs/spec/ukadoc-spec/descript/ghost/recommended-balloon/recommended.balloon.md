# recommended.balloon,バルーン名

- **規格**: [recommended.balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.md)
- **検索語**: recommended.balloon
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `recommended.balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。`ui/js/ghost/ghost.js` (`selectGhost`) にて連動切り替えを行う実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [balloon,バルーン名], [recommended.balloon,バルーン名]:`
- `ui/js/ghost/ghost.js` `// [balloon,バルーン名], [recommended.balloon,バルーン名]...`
