# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/file/charset/) (ukadoc-spec/descript/shell-surfaces/file/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:28` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan.rs:29` `|| utf8_str.to_lowercase().contains("charset,sjis")`
- `crates/ui/src/lib.rs:26` `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:37` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/commands/install.rs:38` `|| utf8_str.to_lowercase().contains("charset,sjis")`
