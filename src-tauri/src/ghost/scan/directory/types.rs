use crate::common::models::GhostInfo;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

#[allow(dead_code)]
impl ScanResult {
    pub fn new(ghosts: Vec<GhostInfo>, resolved_path: String, input_path: String) -> Self {
        Self {
            ghosts,
            resolved_path,
            input_path,
        }
    }

    // Add getter methods
    pub fn ghosts(&self) -> &[GhostInfo] {
        &self.ghosts
    }
    pub fn resolved_path(&self) -> &str {
        &self.resolved_path
    }
    pub fn input_path(&self) -> &str {
        &self.input_path
    }
}
