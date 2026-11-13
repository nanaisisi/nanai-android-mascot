# descript.txt（Ghostの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` パスを自動探索・発見し、`read_descript_file()` を通じてキー・バリューの読み込みおよびパラメータ抽出を行う実装が行われている。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:1` `//! バルーン descript.txt プロパティ検証 & 推薦ゴースト判定エンジン (UKADOC / SSP 準拠)`
- `src-tauri/src/tray.rs:123` `let descript_path = ghost_master_dir.join("descript.txt");`
- `ui/ts/core/config.ts:22` `descriptTxt: "descript.txt",`
- `ui/ts/ui/spec-compliance-runner.ts:322` `const specName = "descript.txt (validrect / origin / wordwrappoint)";`
- `tests/verification-suite.test.ts:162` `it("descript.txt (入力) ➔ レイアウトパーサー (パイプライン) ➔ CSS変数/DOM (出力) の全経路が成立すること", () => `
- `crates/nanai-core/src/descript_parser.rs:1` `//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン`
