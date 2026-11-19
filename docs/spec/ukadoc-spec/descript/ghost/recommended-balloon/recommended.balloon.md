# recommended.balloon,バルーン名

- **規格**: [recommended.balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.md)
- **検索語**: recommended.balloon
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` 等においてゴーストの `descript.txt` 内の `recommended.balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。フロントエンド連動切り替えを含む全処理が完全に行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs` (`recommended.balloon`)
- `src-tauri/src/common/models.rs` (`recommended_balloon`)
- `src-tauri/src/ghost/scan/directory/manifest.rs` (`recommended.balloon`)
