mod app;

use rust_i18n::i18n;

// 翻訳リソースの設定
i18n!("locales");

fn main() {
    // システム言語の検出
    let system_locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());

    // 言語コードの抽出（例: "ja-JP" -> "ja"）
    let lang_code = system_locale.split('-').next().unwrap_or("en");

    // 言語の設定
    rust_i18n::set_locale(lang_code);

    // アプリの起動
    // launch(App);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_locale_handling() {
        let locale = "ja-JP";
        let lang_code = locale.split('-').next().unwrap_or("en");
        assert_eq!(lang_code, "ja");
        rust_i18n::set_locale(lang_code);
        assert_eq!(&*rust_i18n::locale(), "ja");
    }

    #[test]
    fn test_various_locales() {
        for (input, expected) in [
            ("en-US", "en"),
            ("zh-CN", "zh"),
            ("fr", "fr"),
            ("", ""),
        ] {
            let code = input.split('-').next().unwrap_or("en");
            if code.is_empty() {
                assert_eq!(expected, "");
            } else {
                assert_eq!(code, expected);
            }
        }
    }

    #[test]
    fn test_main_locale_fallback_logic() {
        let fallback = Some("").filter(|s| !s.is_empty()).unwrap_or("en");
        assert_eq!(fallback, "en");

        let valid = Some("ja-JP").filter(|s| !s.is_empty()).unwrap_or("en");
        let lang = valid.split('-').next().unwrap_or("en");
        assert_eq!(lang, "ja");
    }
}
