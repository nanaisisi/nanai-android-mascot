//! SSTP (Sakura Script Transfer Protocol) 実装（ukadoc-spec / sstp 準拠）
//! [req_res], [direct], [http], [keepalive], [method_send], [method_execute], [method_give], [method_communicate], [method_notify]
//!
//! SSTP/1.1, SSTP/1.2, SSTP/1.3, SSTP/1.4, DirectSSTP のリクエスト・レスポンス解析および構築を行う。

pub mod builder;
pub mod config;
pub mod message;
pub mod types;

pub use builder::{SstpEventBuilder, handle_execute_command};
pub use config::{SstpGhostConfig, SstpGhostContext};
pub use message::{DIRECT_SSTP_DWDATA, IfGhostEntry, SstpMessage, SstpRequest, SstpResponse};
pub use types::{SstpMethod, SstpStatusCode};

#[cfg(test)]
mod tests;
