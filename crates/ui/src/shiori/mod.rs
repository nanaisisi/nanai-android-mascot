//! SHIORI/3.0 プロトコル実装（ukadoc-spec / shiori3 準拠）
//!
//! リクエスト（GET / NOTIFY）・レスポンス（200 / 204 / 311 / 312 / 400 / 500）
//! の構築・解析を行う。SSP 拡張ヘッダ（SenderType / SecurityLevel /
//! SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify /
//! Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age /
//! MarkerSend）にも対応する。
//!
//! 改行コードは CR+LF、末尾は空行（CRLF×2）で終端する。
//! `Charset` は UTF-8 を既定とする。

pub mod protocol;
pub mod types;

pub use protocol::{ShioriRequest, ShioriResponse};
pub use types::{
    ErrorLevel, GhostStatusToken, SecurityLevel, SenderTypeTag, ShioriMethod, StatusCode,
    parse_sender_types,
};

#[cfg(test)]
mod tests;
