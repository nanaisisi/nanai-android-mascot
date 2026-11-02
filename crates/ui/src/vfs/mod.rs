mod path;
mod encoding;
mod resolver;
mod mock;

pub use path::{normalize_vfs_path, resolve_vfs_path};
pub use encoding::{detect_and_decode, open_shift_jis_file, open_text_file};
pub use resolver::VfsResolver;
pub use mock::MockVfs;

#[cfg(test)]
mod tests;
