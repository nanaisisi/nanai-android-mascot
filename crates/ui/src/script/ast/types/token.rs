//! さくらスクリプト単一トークンデータ構造モジュール

use crate::script::command::SakuraCommand;
use serde::{Deserialize, Serialize};

/// さくらスクリプトの単一トークン表現
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SakuraToken {
    pub command: SakuraCommand,
    pub raw: Option<String>,
}

impl SakuraToken {
    pub fn new(command: SakuraCommand) -> Self {
        Self { command, raw: None }
    }

    pub fn with_raw(command: SakuraCommand, raw: impl Into<String>) -> Self {
        Self {
            command,
            raw: Some(raw.into()),
        }
    }
}
