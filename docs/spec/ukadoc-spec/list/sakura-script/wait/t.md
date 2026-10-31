# \t

- **規格**: [t.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/t/) (ukadoc-spec/list/sakura-script/wait/t.md)
- **検索語**: \t
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「\t」を確認。

## 実装箇所

- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/update.rs:110` `let content = "\r\n  \r\n\t\r\n";`
- `crates/ui/src/script/command.rs:60` `Timeout,      // \t (タイムアウト抑止)`
