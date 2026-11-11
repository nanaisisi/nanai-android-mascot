# \![effect2,追加サーフェスID,プラグイン名,速度倍率,パラメータ]

- **規格**: [bang-effect2-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-effect2-ID/) (ukadoc-spec/list/sakura-script/surface/bang-effect2-ID.md)
- **検索語**: Command
- **対応状況**: ⚠️ 一部対応

## 突合結果

サーフェス・ウィンドウ位置・エフェクト関連スクリプトコマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/shiori-host/src/main.rs:228` `let status = std::process::Command::new("rustc")`
- `src-tauri/src/shiori/dynamic/host.rs:64` `use std::process::{Command, Stdio};`
- `src-tauri/src/shiori/dynamic/host.rs:68` `let mut child = Command::new(exe)`
- `crates/ui/src/script/command.rs:169` `Command {`
