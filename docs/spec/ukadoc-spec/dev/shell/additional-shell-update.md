# 追加シェルのネットワーク更新について

- **規格**: [shell.md](../../../../ukadoc-spec/dev/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/shell/))
- **検索語**: homeurl
- **対応状況**: ⚠️ 一部対応

## 突合結果

追加シェルの homeurl / updates2.dau によるネットワーク更新に対応。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:43` `self.get("homeurl")`
- `src-tauri/src/commands/ext.rs:44` `.or_else(|| map.get("homeurl").cloned());`
- `crates/ui/src/descript/tests.rs:57` `homeurl,https://home.url\n\`
- `src-tauri/src/commands/ext.rs:109` `.or_else(|| map.get("homeurl").cloned());`
- `crates/ui/src/descript/tests.rs:79` `assert_eq!(desc.homeurl().unwrap(), "https://home.url");`
- `src-tauri/src/commands/update/dau.rs:11` `homeurl: String,`
