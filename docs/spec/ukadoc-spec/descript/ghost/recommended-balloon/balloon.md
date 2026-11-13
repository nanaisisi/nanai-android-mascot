# balloon,バルーン名

- **規格**: [balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/balloon.md)
- **検索語**: balloon
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。`ui/js/ghost/ghost.js` (`selectGhost`) にて連動切り替えを行う実装が行われている。

## 実装箇所

- `crates/nanai-core/src/install_protocol.rs:8` `"balloon",`
- `src-tauri/src/commands/install/utils.rs:97` `.map_err(|e| format!("Failed to inspect balloon directory: {e}"))?`
- `ui/main.ts:294` `balloonDisplay: "balloon-display",`
- `ui/balloon.html:8` `<link rel="stylesheet" href="css/balloon-theme.css" />`
- `tests/app-actions.test.ts:18` `test("actionMethods.handleMenuAction covers all branches including Tauri folder `
- `crates/nanai-core/src/install_protocol.rs:209` `assert_eq!(normalize_install_type(Some(" Balloon ")), "balloon");`
