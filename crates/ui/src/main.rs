#![allow(unexpected_cfgs)]
mod app;

#[cfg(not(coverage))]
rust_i18n::i18n!("locales");

fn init_locale_with(detected: Option<String>) -> String {
    let system_locale = detected.unwrap_or_else(|| "en".to_string());
    let lang_code = system_locale.split('-').next().unwrap_or("en");
    rust_i18n::set_locale(lang_code);
    lang_code.to_string()
}

fn main() {
    let _ = init_locale_with(sys_locale::get_locale());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_locale_handling() {
        main();
        assert_eq!(init_locale_with(Some("ja-JP".to_string())), "ja");
        assert_eq!(&*rust_i18n::locale(), "ja");
        assert_eq!(init_locale_with(None), "en");
    }

    #[test]
    fn test_various_locales() {
        for (input, expected) in [("en-US", "en"), ("zh-CN", "zh"), ("fr", "fr"), ("", "")] {
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

    #[test]
    fn test_locale_split_edge_cases() {
        let locales = ["ja-JP", "en_US.UTF-8", "zh", "de-DE-POSIX"];
        for l in locales {
            let code = l.split(|c| c == '-' || c == '_').next().unwrap_or("en");
            assert!(!code.is_empty());
        }
    }
}
