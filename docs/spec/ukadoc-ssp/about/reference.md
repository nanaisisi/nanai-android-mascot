# 用語説明

- **規格**: [about/reference.md](https://ukatech.shillest.net/ukadoc-ssp/about/reference/) (ukadoc-ssp/about/reference.md)
- **対応状況**: ✅ 実装済

## 突合結果

伺か専門用語（ゴースト、シェル、バルーン、SHIORI等）の解説

## 実装箇所

- `crates/ui/src/shiori/protocol/request/parser.rs:59` `if let Some(rest) = lower.strip_prefix("reference") {`
- `src-tauri/src/shiori/ffi/builder.rs:47` `pub fn reference(mut self, index: usize, value: &str) -> Self {`
- `ui/assets/LICENSE-3RD-PARTY.html:9567` `jurisdiction, without reference to its conflict-of-law provisions.`
- `ui/ts/ui/renderers/inputs/input-helpers.ts:81` `} else if (p.startsWith("--reference=")) {`
- `tests/e2e/ssp-dialogs.test.ts:112` `"\\0\\![open,communicatebox,--text=HelloGhost,--reference=extra_ref]\\e";`
- `crates/ui/src/shiori/protocol/response/parse/core.rs:76` `if let Some(rest) = key_l.strip_prefix("reference") {`
