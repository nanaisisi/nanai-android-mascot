use std::path::Path;

/// Check if ghost directory should be skipped due to ignore files (.dev_ignore, .narignore, etc.)
pub fn should_skip_directory(path: &Path) -> bool {
    path.join(".dev_ignore").exists()
        || path.join(".narignore").exists()
        || path.join(".updateignore").exists()
        || path.join(".narinclude").exists()
        || path.join(".updateinclude").exists()
}

/// Parse developer_options.txt if present
pub fn parse_developer_options(path: &Path) {
    let dev_options_path = path.join("developer_options.txt");
    if dev_options_path.exists()
        && let Ok(dev_content) = std::fs::read_to_string(&dev_options_path)
    {
        for dev_line in dev_content.lines() {
            let trimmed = dev_line.trim();
            if !trimmed.is_empty() && !trimmed.starts_with("//") {
                println!("🛠️ Developer option entry: {}", trimmed);
            }
        }
    }
}
