use serde::{Deserialize, Serialize};

/// DirectSSTP 関連定数 (Windows WM_COPYDATA 互換 dwData)
pub const DIRECT_SSTP_DWDATA: usize = 9801;

/// IfGhost によるスクリプト振り分けエントリ
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IfGhostEntry {
    pub(crate) target: String,
    pub(crate) script: String,
}

#[allow(dead_code)]
impl IfGhostEntry {
    // Add getter methods
    pub fn target(&self) -> &str { &self.target }
    pub fn script(&self) -> &str { &self.script }
}
