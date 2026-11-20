# descript.txt（Ghostの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` パスを自動探索・発見し、`read_descript_file()` を通じてキー・バリューの読み込みおよびパラメータ抽出を行う実装が行われている。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:1` `//! バルーン descript.txt プロパティ検証 & 推薦ゴースト判定エンジン (UKADOC / SSP 準拠)`
- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `ui/ts/core/config.ts:22` `descriptTxt: "descript.txt",`
- `ui/ts/ui/submenu-theme.ts:3` `* @brief シェルの descript.txt 由来のカスタムメニュー配色・背景ビットマップテーマ適用および画像プリロードモジュール`
- `crates/nanai-core/src/descript_parser/mod.rs:1` `//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
