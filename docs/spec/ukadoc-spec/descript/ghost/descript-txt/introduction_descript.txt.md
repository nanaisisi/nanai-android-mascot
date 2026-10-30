# descript.txt（Ghostの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` パスを自動探索・発見し、`read_descript_file()` を通じてキー・バリューの読み込みおよびパラメータ抽出を行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:95` `// [descript.txt（Headlineの）]: ヘッドライン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:96` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/install/archive.rs:23` `} else if lower == "descript.txt" || lower.ends_with("/descript.txt") {`
