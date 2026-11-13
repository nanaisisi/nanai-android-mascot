# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["readme"]` を検出し、`--balloon-readme` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:74` `pub fn readme(&self) -> Option<&str> {`
- `src-tauri/src/commands/ext.rs:48` `let _readme = map.get("readme");`
- `ui/ts/core/actions/balloon-descript/assets.ts:67` `if (p.readme) root.style.setProperty("--balloon-readme", p.readme);`
- `ui/ts/ui/renderers/menu-caption-general-part2.ts:129` `id: "readme-btn",`
- `tests/command-handler-boost.test.ts:125` `await handleOpenSystemTarget(handler, ["open", "readme"]);`
- `crates/nanai-core/src/descript_parser.rs:75` `self.get("readme")`
