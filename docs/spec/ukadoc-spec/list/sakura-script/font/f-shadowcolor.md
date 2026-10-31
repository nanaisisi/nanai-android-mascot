# \f[shadowcolor,色指定]

- **規格**: [f-shadowcolor.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-shadowcolor/) (ukadoc-spec/list/sakura-script/font/f-shadowcolor.md)
- **検索語**: \f
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「\f」を確認。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:71` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/mod.rs:63` `// \f[tag,param] または \f[tag] (\f[name], \f[height], \f[color], \f[bold], \f[ital`
