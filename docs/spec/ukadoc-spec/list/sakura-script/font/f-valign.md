# \f[valign,寄せる側]

- **規格**: [f-valign.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-valign/) (ukadoc-spec/list/sakura-script/font/f-valign.md)
- **検索語**: \f
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「\f」を確認。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/script/command.rs:92` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/executor.rs:66` `// \f[tag,param] または \f[tag]`
- `crates/ui/src/script/parser/tests.rs:16` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
