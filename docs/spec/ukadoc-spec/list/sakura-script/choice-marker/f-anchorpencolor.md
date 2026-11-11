# \f[anchorpencolor,色指定]

- **規格**: [f-anchorpencolor.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice-marker/f-anchorpencolor/) (ukadoc-spec/list/sakura-script/choice-marker/f-anchorpencolor.md)
- **検索語**: \f
- **対応状況**: ⚠️ 一部対応

## 突合結果

\f[...] フォント・スタイル設定タグ（アンカー色・カーソル色指定含む）のパースおよび SakuraCommand::Font へのマッピングを実装 (crates/ui/src/script/parser/mod.rs, asic.rs)。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/script/command.rs:92` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/executor.rs:66` `// \f[tag,param] または \f[tag]`
- `crates/ui/src/script/parser/tests.rs:16` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
