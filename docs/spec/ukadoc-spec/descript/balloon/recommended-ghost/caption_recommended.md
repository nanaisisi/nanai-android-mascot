# 推奨の意味

- **規格**: [caption_recommended.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/recommended-ghost/caption_recommended.md)
- **検索語**: 推奨の意味
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` および `src-tauri/src/commands/shell/balloon.rs` において `recommended.ghost` / `recommended.ghost.path` を抽出し、`--balloon-recommended-ghost` スタイルバインドへバインド対応済。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` `/// [推奨の意味], [recommended.ghost,ゴースト名]`
- `ui/js/core/actions/balloon-descript/assets.js` `if (props["recommended.ghost"])`
