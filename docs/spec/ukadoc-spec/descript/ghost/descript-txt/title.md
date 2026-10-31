# title,表示名

- **規格**: [title.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/title.md)
- **検索語**: title
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `title` キーをパース（`name` のフォールバック）し、表示用 `GhostInfo.name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/tauri.conf.json:16` `"title": "Nanai Android Mascot",`
- `src-tauri/tauri.test.conf.json:16` `"title": "nanai-android-mascot-test",`
- `src-tauri/src/commands/calendar.rs:14` `pub title: String,`
- `src-tauri/src/commands/shell/ghost.rs:27` `.title("アンインストール確認")`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:106` `.title(format!("Nanai Android Mascot - {}", ghost_name))`
