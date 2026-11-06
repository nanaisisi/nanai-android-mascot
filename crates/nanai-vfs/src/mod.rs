//! Nanai VFS - Shift_JIS aware archive extraction and virtual file systems
pub mod encoding;
pub mod mock;
pub mod overlay;
pub mod path;
pub mod resolver;
pub mod traits;

pub use encoding::{
    DecodeResult, detect_and_decode, detect_and_decode_ext, detect_mime_type, encode_to_charset,
    normalize_newlines, open_shift_jis_file, open_text_file,
};
pub use mock::MockVfs;
pub use overlay::OverlayVfs;
pub use path::{is_safe_vfs_path, normalize_vfs_path, resolve_vfs_path, sanitize_vfs_path};
pub use resolver::VfsResolver;
pub use traits::VirtualFileSystem;
