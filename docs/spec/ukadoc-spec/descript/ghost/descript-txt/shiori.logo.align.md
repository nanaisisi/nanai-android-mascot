# shiori.logo.align,位置情報

- **規格**: [shiori.logo.align.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.logo.align.md)
- **検索語**: shiori.logo.align
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `shiori.logo.align` キーのパースおよびロゴ配置処理が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:133` `.and_then(|m| m.get("shiori.logo.align").cloned());`
