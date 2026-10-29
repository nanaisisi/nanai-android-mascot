# title,表示名

- **規格**: [title.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/title.md)
- **検索語**: title
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `title` キーをパース（`name` のフォールバック）し、表示用 `GhostInfo.name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [name,ゴースト名], [title,表示名], [type,種別]:`
