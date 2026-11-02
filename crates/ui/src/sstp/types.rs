use serde::{Deserialize, Serialize};

/// SSTP メソッド
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpMethod {
    Send,
    Notify,
    Execute,
    Communicate,
    Give,
}

impl SstpMethod {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Send => "SEND",
            Self::Notify => "NOTIFY",
            Self::Execute => "EXECUTE",
            Self::Communicate => "COMMUNICATE",
            Self::Give => "GIVE",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        let upper = s.trim().to_uppercase();
        if upper == "SEND" {
            Some(Self::Send)
        } else if upper == "NOTIFY" {
            Some(Self::Notify)
        } else if upper == "EXECUTE" {
            Some(Self::Execute)
        } else if upper == "COMMUNICATE" {
            Some(Self::Communicate)
        } else if upper == "GIVE" {
            Some(Self::Give)
        } else {
            None
        }
    }
}

/// SSTP レスポンスステータスコード
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpStatusCode {
    Ok = 200,
    NoContent = 204,
    Break = 210,
    BadRequest = 400,
    NotFound = 404,
    RequestTimeout = 408,
    Conflict = 409,
    PayloadTooLarge = 413,
    Refuse = 420,
    InternalServerError = 500,
    NotImplemented = 501,
    ServiceUnavailable = 503,
    VersionNotSupported = 505,
    Invisible = 512,
}

impl SstpStatusCode {
    pub fn code(&self) -> u16 {
        *self as u16
    }

    pub fn reason_phrase(&self) -> &'static str {
        match self {
            Self::Ok => "OK",
            Self::NoContent => "No Content",
            Self::Break => "Break",
            Self::BadRequest => "Bad Request",
            Self::NotFound => "Not Found",
            Self::RequestTimeout => "Request Timeout",
            Self::Conflict => "Conflict",
            Self::PayloadTooLarge => "Payload Too Large",
            Self::Refuse => "Refuse",
            Self::InternalServerError => "Internal Server Error",
            Self::NotImplemented => "Not Implemented",
            Self::ServiceUnavailable => "Service Unavailable",
            Self::VersionNotSupported => "Version Not Supported",
            Self::Invisible => "Invisible",
        }
    }
}
