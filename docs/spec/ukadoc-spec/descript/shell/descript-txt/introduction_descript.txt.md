# descript.txt（Shellの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/introduction_descript.txt/) (ukadoc-spec/descript/shell/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:95` `// [descript.txt（Headlineの）]: ヘッドライン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:96` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/install/archive/inspection.rs:32` `} else if lower == "descript.txt" || lower.ends_with("/descript.txt") {`
