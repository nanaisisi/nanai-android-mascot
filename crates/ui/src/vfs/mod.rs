mod encoding;
mod mock;
mod overlay;
mod path;
mod resolver;
mod traits;

pub use encoding::{
    detect_and_decode, encode_to_charset, normalize_newlines, open_shift_jis_file, open_text_file,
};
pub use mock::MockVfs;
pub use overlay::OverlayVfs;
pub use path::{is_safe_vfs_path, normalize_vfs_path, resolve_vfs_path, sanitize_vfs_path};
pub use resolver::VfsResolver;
pub use traits::VirtualFileSystem;

#[cfg(test)]
mod tests;
