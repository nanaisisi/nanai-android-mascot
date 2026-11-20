# balloon,バルーン名

- **規格**: [balloon.md](../../../../../ukadoc-spec/descript/shell/descript-txt/balloon.md)
- **検索語**: balloon
- **対応状況**: ✅ 実装済

## 突合結果

未確認・未実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/tests.rs:7` `assert_eq!(normalize_install_type(Some(" Balloon ")), "balloon");`
- `src-tauri/src/events.rs:44` `} else if id.starts_with("balloon-") {`
- `ui/ts/core/app-actions.ts:11` `import { balloonActions } from "./actions/balloon-actions.js";`
- `ui/balloon.html:8` `<link rel="stylesheet" href="css/balloon-theme.css" />`
- `tests/app-actions.test.ts:29` `test("actionMethods.handleMenuAction covers all branches including Tauri folder `
- `crates/nanai-core/src/install_protocol/tests.rs:39` `install_type: "balloon",`
