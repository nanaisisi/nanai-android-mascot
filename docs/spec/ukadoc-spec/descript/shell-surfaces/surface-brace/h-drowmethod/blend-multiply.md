# blend-multiply

- **規格**: [blend-multiply.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/blend-multiply/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/blend-multiply.md)
- **検索語**: blend-multiply
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「blend-multiply」を確認。


## 実装箇所

- `crates/ui/src/surfaces/tests.rs:51` `DrawMethod::parse("blend-multiply"),`
- `crates/ui/src/surfaces/tests.rs:333` `animation1.pattern,blend-multiply,11,40,5,6`
- `crates/ui/src/surfaces/types/draw.rs:22` `/// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）`
- `ui/js/surface/surface-compositor.js:175` `} else if (method === "blend-multiply" || method === "multiply") {`
