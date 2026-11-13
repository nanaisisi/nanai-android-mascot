# recommended.ghost,ゴースト名

- **規格**: [recommended.ghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/recommended-ghost/recommended.ghost.md)
- **検索語**: recommended.ghost
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` および `src-tauri/src/commands/shell/balloon.rs` において `recommended.ghost` を検出し、`--balloon-recommended-ghost` カスタムプロパティへバインド対応済。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:24` `let rec_name = get_prop("recommended.ghost").map(|s| s.trim()).filter(|s| !s.is_`
- `crates/nanai-core/src/balloon_descript.rs:25` `let rec_path = get_prop("recommended.ghost.path").map(|s| s.trim()).filter(|s| !`
- `crates/nanai-core/src/balloon_descript.rs:148` `props.insert("recommended.ghost".to_string(), "Emily".to_string());`
- `ui/ts/core/actions/balloon-descript/assets.ts:9` `* [推奨の意味] [recommended.ghost,ゴースト名] [recommended.ghost.path,パス] の検証関数 (UKADOC準拠)`
- `ui/ts/core/actions/balloon-descript/assets.ts:16` `const recGhost = props["recommended.ghost"];`
