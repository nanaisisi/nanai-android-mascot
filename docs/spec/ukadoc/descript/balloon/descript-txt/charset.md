# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/charset/) (ukadoc-spec/descript/balloon/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「charset」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:28`  `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan.rs:29`  `|| utf8_str.to_lowercase().contains("charset,sjis")`
- `crates/ui/src/lib.rs:26`  `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:37`  `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/commands/install.rs:38`  `|| utf8_str.to_lowercase().contains("charset,sjis")`
