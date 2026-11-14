//! SHIORI ローダー候補・試行ログデータ構造定義

use super::super::trait_def::ShioriEngine;
use std::path::PathBuf;

/// 候補種別
pub enum ShioriEngineCandidate {
    Dynamic(PathBuf),
    Wasm(PathBuf),
    Mock(Box<dyn ShioriEngine>),
}

/// 候補種別の識別タグ
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CandidateKind {
    Dynamic,
    Wasm,
    Mock,
}

/// ロード試行ログ（フェイルオーバーテレメトリ）
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoadAttempt {
    pub(crate) kind: CandidateKind,
    pub(crate) path: Option<PathBuf>,
    pub(crate) success: bool,
    pub(crate) error: Option<String>,
}

#[allow(dead_code)]
impl LoadAttempt {
    // Add getter methods
    pub fn kind(&self) -> CandidateKind {
        self.kind
    }
    pub fn path(&self) -> Option<&PathBuf> {
        self.path.as_ref()
    }
    pub fn success(&self) -> bool {
        self.success
    }
    pub fn error(&self) -> Option<&str> {
        self.error.as_deref()
    }
}
