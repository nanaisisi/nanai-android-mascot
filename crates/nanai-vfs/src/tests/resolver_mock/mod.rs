//! VfsResolver および MockVfs の単体テスト群

mod mock_vfs;
mod vfs_resolver;

use super::super::*;
use encoding_rs::SHIFT_JIS;
use std::sync::atomic::{AtomicUsize, Ordering};

static TEMP_COUNTER: AtomicUsize = AtomicUsize::new(0);

pub(super) fn unique_temp_dir(prefix: &str) -> std::path::PathBuf {
    let count = TEMP_COUNTER.fetch_add(1, Ordering::SeqCst);
    let dir = std::env::temp_dir().join(format!("{}_{}_{}", prefix, std::process::id(), count));
    let _ = std::fs::create_dir_all(&dir);
    dir
}
