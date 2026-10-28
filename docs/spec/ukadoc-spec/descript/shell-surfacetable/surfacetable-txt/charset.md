# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/charset/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 実装済 (Rust パーサー `crates/ui/src/surfacetable.rs` で解析・データ化済 / 表示側は別レイヤー)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `crates/ui/src/surfacetable.rs` （Rust 版 surfacetable.txt パーサー：charset / version / scope / option / group / サーフィスID・名前 解析）

- `src-tauri/src/ghost/scan.rs:28` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan.rs:29` `|| utf8_str.to_lowercase().contains("charset,sjis")`
- `crates/ui/src/lib.rs:26` `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:37` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/commands/install.rs:38` `|| utf8_str.to_lowercase().contains("charset,sjis")`
