# \![bind-noevent,カテゴリ名,パーツ名,数値]

- **規格**: [bang-bind-noevent.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-bind-noevent/) (ukadoc-spec/list/sakura-script/surface/bang-bind-noevent.md)
- **検索語**: Bind
- **対応状況**: ✅ 実装済

## 突合結果

\\![bind,...] 着せ替え制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Bind)。

## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:120` `DrawMethod::Add | DrawMethod::Bind => "add".to_string(),`
- `src-tauri/src/shiori/ffi/interface.rs:2` `//! SHIORI FFI Bindings (Interface)`
- `src-tauri/src/shiori/ffi/mod.rs:1` `//! SHIORI FFI Bindings`
- `crates/ui/src/lib.rs:15` `pub use descript::{BindGroup, BindOptionGroup, CharDefaults, Descript};`
- `crates/ui/src/lib.rs:104` `SakuraCommand::Bind {`
