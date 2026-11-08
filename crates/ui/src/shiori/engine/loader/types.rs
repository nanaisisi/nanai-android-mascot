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
    pub kind: CandidateKind,
    pub path: Option<PathBuf>,
    pub success: bool,
    pub error: Option<String>,
}
