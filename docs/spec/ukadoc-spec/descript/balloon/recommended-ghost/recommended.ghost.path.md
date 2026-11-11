# recommended.ghost.path,パス

- **規格**: [recommended.ghost.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/recommended-ghost/recommended.ghost.path.md)
- **検索語**: recommended.ghost.path
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` および `src-tauri/src/commands/shell/balloon.rs` において `recommended.ghost.path` を検出し、`--balloon-recommended-ghost-path` カスタムプロパティへバインド対応済。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:9` `* [推奨の意味] [recommended.ghost,ゴースト名] [recommended.ghost.path,パス] の検証関数 (UKADOC準拠)`
- `ui/ts/core/actions/balloon-descript/assets.ts:17` `const recPath = props["recommended.ghost.path"];`
- `ui/ts/core/actions/balloon-descript/assets.ts:73` `// [推奨の意味], [recommended.ghost,ゴースト名], [recommended.ghost.path,パス]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:80` `if (p["recommended.ghost.path"]) {`
- `ui/ts/core/actions/balloon-descript/assets.ts:83` `p["recommended.ghost.path"],`
