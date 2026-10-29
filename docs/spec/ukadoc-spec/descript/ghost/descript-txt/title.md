# title,表示名

- **規格**: [title.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/title/) (ukadoc-spec/descript/ghost/descript-txt/title.md)
- **検索語**: title
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「title」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/tauri.conf.json:16` `"title": "Nanai Android Mascot",`
- `src-tauri/tauri.test.conf.json:16` `"title": "nanai-android-mascot-test",`
- `src-tauri/src/commands/window/loading_banner_window.rs:66` `.title("Loading Banner")`
- `src-tauri/src/commands/window/character_window.rs:52` `let title = if scope_id == 0 {`
- `src-tauri/src/commands/window/character_window.rs:63` `.title(title)`
