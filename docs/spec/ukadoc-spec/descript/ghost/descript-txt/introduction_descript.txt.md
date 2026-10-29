# descript.txt（Ghostの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` パスを自動探索・発見し、`read_descript_file()` を通じてキー・バリューの読み込みおよびパラメータ抽出を行う実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [descript.txt（Ghostの）]: ゴーストマニフェスト定義読込`
