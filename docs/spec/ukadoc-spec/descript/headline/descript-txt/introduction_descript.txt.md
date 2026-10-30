# descript.txt（Headlineの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` (`scan_headlines`) においてヘッドラインの `descript.txt` を自動検索・パース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:95` `// [descript.txt（Headlineの）]: ヘッドライン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:96` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/install/archive.rs:23` `} else if lower == "descript.txt" || lower.ends_with("/descript.txt") {`
