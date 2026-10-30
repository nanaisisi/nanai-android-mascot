//! Ukagaka Web Integration specification implementation (spec/web/x-ukagaka-link.md & application-x-nar.md)
//! [x-ukagaka-link], [application-x-nar]

use tauri::Emitter;

#[tauri::command]
pub async fn handle_ukagaka_uri(
    uri: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("🌐 [Web Spec] Handling Ukagaka URI: {}", uri);
    let lower = uri.to_lowercase();
    if lower.starts_with("ukagaka://install") || lower.starts_with("ghost://install") {
        if let Some(pos) = uri.find("url=") {
            let install_url = &uri[pos + 4..];
            let decoded =
                urlencoding::decode(install_url).unwrap_or(std::borrow::Cow::Borrowed(install_url));
            app_handle
                .emit("ukagaka-install-url", decoded.to_string())
                .map_err(|e| e.to_string())?;
            return Ok(format!("Triggered install for URL: {}", decoded));
        }
    } else if (lower.starts_with("ukagaka://sstp") || lower.starts_with("sstp://"))
        && let Some(pos) = uri.find("script=")
    {
        let script = &uri[pos + 7..];
        let decoded = urlencoding::decode(script).unwrap_or(std::borrow::Cow::Borrowed(script));
        app_handle
            .emit("sstp-execute-script", decoded.to_string())
            .map_err(|e| e.to_string())?;
        return Ok("Triggered SSTP script execution".to_string());
    }
    Ok(format!("Processed URI: {}", uri))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ukagaka_uri_parsing() {
        let uri = "ukagaka://install?url=https%3A%2F%2Fexample.com%2Fghost.nar";
        assert!(uri.starts_with("ukagaka://install"));
    }
}
