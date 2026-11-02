use crate::descript::Descript;
use crate::vfs::{open_text_file, resolve_vfs_path};
use std::path::Path;

/// `descript.txt` を読み込む（無い場合や読込失敗時は空 descript）
pub(crate) fn read_descript(directory: &Path) -> Option<Descript> {
    let path = resolve_vfs_path(directory, "descript.txt").filter(|p| p.is_file())?;
    open_text_file(&path).ok().map(|c| Descript::parse(&c))
}
