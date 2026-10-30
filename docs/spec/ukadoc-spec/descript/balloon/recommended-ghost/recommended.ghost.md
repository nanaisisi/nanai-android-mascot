# recommended.ghost,ゴースト名

- **規格**: [recommended.ghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/recommended-ghost/recommended.ghost.md)
- **検索語**: recommended.ghost
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` および `src-tauri/src/commands/shell/balloon.rs` において `recommended.ghost` を検出し、`--balloon-recommended-ghost` カスタムプロパティへバインド対応済。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js:15` `// [推奨の意味], [recommended.ghost,ゴースト名], [recommended.ghost.path,パス]:`
- `ui/js/core/actions/balloon-descript/assets.js:16` `if (props["recommended.ghost"])`
- `ui/js/core/actions/balloon-descript/assets.js:17` `root.style.setProperty("--balloon-recommended-ghost", props["recommended.ghost"]`
- `ui/js/core/actions/balloon-descript/assets.js:18` `if (props["recommended.ghost.path"])`
- `ui/js/core/actions/balloon-descript/assets.js:19` `root.style.setProperty("--balloon-recommended-ghost-path", props["recommended.gh`
