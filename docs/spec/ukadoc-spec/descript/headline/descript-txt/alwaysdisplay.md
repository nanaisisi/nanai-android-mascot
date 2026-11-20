# alwaysdisplay,数値

- **規格**: [alwaysdisplay.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/alwaysdisplay.md)
- **検索語**: alwaysdisplay
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` においてヘッドラインの `descript.txt` 内の `alwaysdisplay` ディレクティブのパースおよび保持が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/ext.rs:120` `let _always_disp = map.get("alwaysdisplay");`
