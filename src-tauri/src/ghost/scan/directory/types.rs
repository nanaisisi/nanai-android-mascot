use crate::common::models::GhostInfo;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ScanResult {
    pub ghosts: Vec<GhostInfo>,
    pub resolved_path: String,
    pub input_path: String,
}
