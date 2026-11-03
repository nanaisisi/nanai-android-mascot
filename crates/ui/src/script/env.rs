//! SakuraScript Environment Variable Interpolation
//! [environmentvariable.md], [notes_environmentvariable.md]

pub fn expand_sakura_script_env(
    text: &str,
    username: &str,
    selfname: &str,
    keroname: &str,
) -> String {
    let mut result = text.to_string();

    // Replace %property[...] queries
    while let Some(start) = result.find("%property[") {
        if let Some(end) = result[start..].find(']') {
            let query = &result[start + 10..start + end];
            let val = match query {
                "username" => username,
                "currentghost.name" | "name" => selfname,
                _ => "",
            };
            result.replace_range(start..start + end + 1, val);
        } else {
            break;
        }
    }

    // Preserve escaped \% before expanding environment variables
    result = result.replace(r"\%", "\u{E000}");

    // Standard environment variables
    result = result.replace("%username", username);
    result = result.replace("%selfname", selfname);
    result = result.replace("%selfname2", selfname);
    result = result.replace("%keroname", keroname);
    result = result.replace("%year", "2026");
    result = result.replace("%month", "3");
    result = result.replace("%day", "30");
    result = result.replace("%hour", "12");
    result = result.replace("%minute", "00");
    result = result.replace("%second", "00");
    result = result.replace("%dms", "0");
    result = result.replace("%et", "0");
    result = result.replace("%exh", "0");
    result = result.replace("%wronghour", "0");
    result = result.replace("%lastghostname", "");
    result = result.replace("%lastobjectname", "");
    result = result.replace("%screenwidth", "1024");
    result = result.replace("%screenheight", "768");
    result = result.replace("%ms", selfname);
    result = result.replace("%mp", "0");
    result = result.replace("%mh", "0");
    result = result.replace("%me", "0");
    result = result.replace("%mt", "0");
    result = result.replace("%mc", "0");
    result = result.replace("%ml", "0");
    result = result.replace("%mz", "0");
    // %m? 単語-非限定環境変数クエリ [pct-m-q.md]
    result = result.replace("%m?", "");
    // %* (%\*) 環境変数展開 [pct-star.md]
    result = result.replace("%*", "");

    // Restore escaped \% as literal %
    result = result.replace("\u{E000}", "%");
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_env() {
        let script = "%username, hello! Property: %property[username] %property[currentghost.name] %property[unknown_prop] %property[unclosed %m? %* \\%";
        let expanded = expand_sakura_script_env(script, "TestUser", "Nanai", "Kero");
        assert!(expanded.contains("TestUser"));
        assert!(expanded.contains("Nanai"));
        assert!(expanded.contains("%property[unclosed"));
        assert!(!expanded.contains("%m?"));
        assert!(!expanded.contains("%*"));
    }
}
