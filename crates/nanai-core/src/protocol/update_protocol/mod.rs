//! UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
//! TypeScript版 `ui/ts/core/actions/update-protocol.ts` から移植されたRust/WASMコア実装。

mod events;
mod helpers;
mod types;

pub use events::*;
pub use helpers::*;
pub use types::*;

#[cfg(test)]
mod tests;
