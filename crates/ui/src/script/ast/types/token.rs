//! さくらスクリプト単一トークンデータ構造モジュール

use super::super::super::command::SakuraCommand;
use serde::{Deserialize, Serialize};

/// さくらスクリプトの単一トークン表現
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SakuraToken {
    pub(crate) command: SakuraCommand,
    pub(crate) raw: Option<String>,
}

#[allow(dead_code)]
impl SakuraToken {
    // Add getter methods
    pub fn command(&self) -> &SakuraCommand {
        &self.command
    }
    pub fn raw(&self) -> Option<&str> {
        self.raw.as_deref()
    }
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
