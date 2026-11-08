//! 拡張子に基づく MIME タイプ判定モジュール

/// ファイルパスの拡張子から標準的な MIME タイプを取得
pub fn detect_mime_type(path: &str) -> &'static str {
    let lower = path.to_lowercase();
    if lower.ends_with(".png") {
        "image/png"
    } else if lower.ends_with(".pna") {
        "image/x-nar-pna"
    } else if lower.ends_with(".bmp") {
        "image/bmp"
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        "image/jpeg"
    } else if lower.ends_with(".gif") {
        "image/gif"
    } else if lower.ends_with(".webp") {
        "image/webp"
    } else if lower.ends_with(".svg") {
        "image/svg+xml"
    } else if lower.ends_with(".ico") {
        "image/x-icon"
    } else if lower.ends_with(".txt") {
        "text/plain"
    } else if lower.ends_with(".json") {
        "application/json"
    } else if lower.ends_with(".xml") {
        "application/xml"
    } else if lower.ends_with(".html") || lower.ends_with(".htm") {
        "text/html"
    } else if lower.ends_with(".ini") || lower.ends_with(".inf") {
        "text/plain"
    } else if lower.ends_with(".plist") {
        "application/x-plist"
    } else if lower.ends_with(".wav") {
        "audio/wav"
    } else if lower.ends_with(".mp3") {
        "audio/mpeg"
    } else if lower.ends_with(".ogg") {
        "audio/ogg"
    } else if lower.ends_with(".flac") {
        "audio/flac"
    } else if lower.ends_with(".opus") {
        "audio/opus"
    } else if lower.ends_with(".m4a") || lower.ends_with(".aac") {
        "audio/aac"
    } else if lower.ends_with(".mid") || lower.ends_with(".midi") {
        "audio/midi"
    } else if lower.ends_with(".dll") || lower.ends_with(".so") {
        "application/octet-stream"
    } else if lower.ends_with(".zip") || lower.ends_with(".nar") {
        "application/zip"
    } else {
        "application/octet-stream"
    }
}
