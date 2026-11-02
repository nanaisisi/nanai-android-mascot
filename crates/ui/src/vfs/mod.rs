mod encoding;
mod mock;
mod path;
mod resolver;

pub use encoding::{detect_and_decode, open_shift_jis_file, open_text_file};
pub use mock::MockVfs;
pub use path::{normalize_vfs_path, resolve_vfs_path};
pub use resolver::VfsResolver;

#[cfg(test)]
mod tests;
