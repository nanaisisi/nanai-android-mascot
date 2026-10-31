# \f[color,色指定]

- **規格**: [f-color.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-color/) (ukadoc-spec/list/sakura-script/font/f-color.md)
- **検索語**: \f
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\f」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:48` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/mod.rs:59` `// \f[tag,param] または \f[tag]`
