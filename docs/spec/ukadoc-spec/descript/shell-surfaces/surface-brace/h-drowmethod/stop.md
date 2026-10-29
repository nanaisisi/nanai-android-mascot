# stop,ID

- **規格**: [stop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/stop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/stop.md)
- **検索語**: stop
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `crates/ui/src/surfaces/tests.rs:67` `DrawMethod::parse("stop"),`
- `crates/ui/src/surfaces/tests.rs:68` `DrawMethod::Custom("stop".to_string())`
- `crates/ui/src/surfaces/types/draw.rs:24` `/// その他の拡張メソッド（`start`/`stop`/`move`/`import` 等）`
- `crates/ui/src/shiori/protocol/response/parse.rs:197` `fn test_parse_stop_at_empty_line() {`
- `ui/main.js:157` `this.ghostController?.stopSecondChangeTimer?.();`
