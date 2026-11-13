# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/ext.rs` において `filename` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:94` `self.get("arrow.filename")`
- `src-tauri/src/ghost/scan/shell/theme.rs:43` `.get("menu.background.bitmap.filename")`
- `ui/ts/core/actions/balloon-descript/assets.ts:119` `const filename = p[propName];`
- `ui/ts/ui/spec-compliance-runner.ts:393` `"font.name / font.height / arrow.filename / recommended.ghost";`
- `tests/core-actions.test.ts:46` `"arrow.filename": "",`
- `crates/nanai-core/src/balloon_descript.rs:99` `self.get("marker.filename")`
