# blend-multiply

- **規格**: [blend-multiply.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-multiply/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/blend-multiply.md)
- **検索語**: blend-multiply
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/ui/src/surfaces/types/draw.rs:30` `/// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）`
- `crates/ui/src/surfaces/types/draw.rs:184` `DrawMethod::parse("blend-multiply"),`
- `ui/js/surface/surface-load.js:97` `// [blend-multiply-fast]`
- `ui/js/surface/surface-load.js:98` `// [blend-multiply]`
- `ui/js/surface/compositor/layer.js:41` `} else if (method === "blend-multiply" || method === "multiply") {`
