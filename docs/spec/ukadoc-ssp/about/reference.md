# 用語説明

- **規格**: [about/reference.md](https://ukatech.shillest.net/ukadoc-ssp/about/reference/) (ukadoc-ssp/about/reference.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

伺か専門用語（ゴースト、シェル、バルーン、SHIORI等）の解説

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:47` `pub fn reference(mut self, index: usize, value: &str) -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:92` `.reference(0, &x.to_string())`
- `src-tauri/src/shiori/ffi/builder.rs:93` `.reference(1, &y.to_string())`
- `src-tauri/src/shiori/ffi/builder.rs:94` `.reference(2, button)`
- `src-tauri/src/shiori/ffi/builder.rs:137` `.reference(0, &count.to_string())`
