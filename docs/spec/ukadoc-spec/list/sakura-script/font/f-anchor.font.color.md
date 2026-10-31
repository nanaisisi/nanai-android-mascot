# \f[anchor.font.color,色指定]

- **規格**: [f-anchor.font.color.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-anchor.font.color/) (ukadoc-spec/list/sakura-script/font/f-anchor.font.color.md)
- **検索語**: \f
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「\f」を確認。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:70` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/mod.rs:62` `// \f[tag,param] または \f[tag]`
