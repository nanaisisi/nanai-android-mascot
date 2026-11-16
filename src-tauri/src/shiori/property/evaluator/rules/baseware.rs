//! baseware.* プロパティ評価モジュール

pub fn evaluate_baseware_property(sub: &str, window_mode: Option<&str>) -> String {
    match sub {
        "name" => "Nanai Android Mascot".to_string(),
        "version" => env!("CARGO_PKG_VERSION").to_string(),
        "windowmode" => window_mode.unwrap_or("normal").to_string(),
        _ => String::new(),
    }
}
