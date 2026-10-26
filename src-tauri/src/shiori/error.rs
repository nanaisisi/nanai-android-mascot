use std::path::PathBuf;
use thiserror::Error;

/// SHIORI 処理全般で発生するエラー型
#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum ShioriError {
    #[error("Failed to load library '{path}': {source}")]
    LibraryLoad {
        path: PathBuf,
        source: libloading::Error,
    },

    #[error("Symbol '{symbol}' not found in '{path}': {source}")]
    SymbolNotFound {
        symbol: &'static str,
        path: PathBuf,
        source: libloading::Error,
    },

    #[error("Host process error: {0}")]
    HostProcess(String),

    #[error("Memory allocation failed (HGLOBAL)")]
    MemoryAllocationFailed,

    #[error("SHIORI load returned error code: {0}")]
    LoadFailed(i32),

    #[error("Engine is not loaded")]
    NotLoaded,

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("{0}")]
    Other(String),
}
