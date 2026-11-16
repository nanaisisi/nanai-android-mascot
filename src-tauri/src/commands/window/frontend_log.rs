//! フロントエンド（JS/TS）からのログをRustターミナルに転送するコマンド

#[tauri::command]
pub async fn log_from_frontend(message: String, level: Option<String>) -> Result<(), String> {
    let lvl = level.unwrap_or_else(|| "info".to_string());
    match lvl.to_lowercase().as_str() {
        "error" => {
            eprintln!("🌐 [Frontend Error]: {message}");
        }
        "warn" => {
            eprintln!("🌐 [Frontend Warn]: {message}");
        }
        _ => {
            println!("🌐 [Frontend]: {message}");
        }
    }
    Ok(())
}
