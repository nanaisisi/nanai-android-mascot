# overlayscreen

- **規格**: [overlayscreen.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlayscreen/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlayscreen.md)
- **検索語**: overlayscreen
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `crates/nanai-surface/src/types/draw/method.rs:74` `"overlayscreen" => Self::Blend("screen-fast".to_string()),`
- `crates/nanai-surface/src/types/draw/tests.rs:144` `DrawMethod::parse("overlayscreen"),`
