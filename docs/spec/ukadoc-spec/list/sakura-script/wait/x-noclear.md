# \x[noclear]

- **規格**: [x-noclear.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/x-noclear/) (ukadoc-spec/list/sakura-script/wait/x-noclear.md)
- **検索語**: \x
- **対応状況**: ❌ 未実装 (パーサは引数形式を解釈しない)

## 突合結果

パーサは基本形のみ処理し、この引数形式は解釈しない。


## 実装箇所

- `src-tauri/src/shiori/fmo.rs:31` `content.push_str(&format!("{}.path\x01{}\r\n", prefix, rec.path));`
- `src-tauri/src/shiori/fmo.rs:32` `content.push_str(&format!("{}.hwnd\x01{}\r\n", prefix, rec.hwnd));`
- `src-tauri/src/shiori/fmo.rs:33` `content.push_str(&format!("{}.name\x01{}\r\n", prefix, rec.name));`
- `src-tauri/src/shiori/fmo.rs:34` `content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));`
- `src-tauri/src/shiori/fmo.rs:35` `content.push_str(&format!("{}.sakura.surface\x01{}\r\n", prefix, rec.sakura_surf`
