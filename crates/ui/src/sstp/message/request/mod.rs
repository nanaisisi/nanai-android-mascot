pub mod core;
pub mod parser;
pub mod types;

pub use core::SstpRequest;
pub use types::{DIRECT_SSTP_DWDATA, IfGhostEntry};

/// Slot-01 Contract: SSTP メッセージ型エイリアス
pub type SstpMessage = SstpRequest;
