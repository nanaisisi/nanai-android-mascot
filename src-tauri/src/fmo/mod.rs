//! FMO (File Mapping Object) 共有状態管理 (UKADOC 規格準拠)
//! 起動中ゴーストの状態（サーフィス、名前、バルーンテキスト等）を外部ツールや他プロセスへ公開するインターフェース

#![allow(unused_imports)]

mod commands;
mod types;

pub use crate::ui_adapter::fmo::FmoEntry;
pub use commands::*;
pub use types::*;

#[cfg(test)]
mod tests;
