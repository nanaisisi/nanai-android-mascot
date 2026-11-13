# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/tests.rs:8` `descript {\r\nversion,1\r\nmaxwidth,300\r\nanimation.sort,ascend\r\ncollision.so`
- `src-tauri/src/tray.rs:123` `let descript_path = ghost_master_dir.join("descript.txt");`
- `ui/ts/core/config.ts:22` `descriptTxt: "descript.txt",`
- `ui/ts/ui/app-menu.ts:70` `const manifestDescript = (sm?.shellManifest?.descript || {}) as Record<`
- `tests/balloon-cycle10-typography.test.ts:3` `import { applyGroupProperties } from "../ui/ts/core/actions/balloon-descript/fon`
- `crates/nanai-surface/src/parser/helpers/blocks.rs:172` `if raw.strip_prefix("descript").is_some() {`
