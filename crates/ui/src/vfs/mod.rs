pub use nanai_vfs::{
    DecodeResult, MockVfs, OverlayVfs, VfsResolver, VirtualFileSystem, denormalize_newlines,
    detect_and_decode, detect_and_decode_ext, detect_mime_type, encode_to_charset,
    is_safe_vfs_path, is_windows_reserved_name, normalize_charset_name, normalize_newlines,
    normalize_vfs_path, open_shift_jis_file, open_text_file, resolve_vfs_path,
    sanitize_vfs_path, wildcard_match,
};
