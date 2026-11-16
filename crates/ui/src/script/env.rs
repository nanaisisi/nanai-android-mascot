//! SakuraScript Environment Variable Interpolation
//! [environmentvariable.md], [notes_environmentvariable.md]

#[allow(non_camel_case_types)]
pub struct Expand_sakura_script_envParams<'a> {
    pub(crate) text: &'a str,
    pub(crate) username: &'a str,
    pub(crate) selfname: &'a str,
    pub(crate) keroname: &'a str,
    pub(crate) lastghostname: &'a str,
    pub(crate) lastobjectname: &'a str,
    pub(crate) screen_width: u32,
    pub(crate) screen_height: u32,
}

#[allow(dead_code)]
impl<'a> Expand_sakura_script_envParams<'a> {
    pub fn text(&self) -> &'a str {
        self.text
    }
    pub fn username(&self) -> &'a str {
        self.username
    }
    pub fn selfname(&self) -> &'a str {
        self.selfname
    }
    pub fn keroname(&self) -> &'a str {
        self.keroname
    }
    pub fn lastghostname(&self) -> &'a str {
        self.lastghostname
    }
    pub fn lastobjectname(&self) -> &'a str {
        self.lastobjectname
    }
    pub fn screen_width(&self) -> u32 {
        self.screen_width
    }
    pub fn screen_height(&self) -> u32 {
        self.screen_height
    }

    pub fn new(text: &'a str, username: &'a str, selfname: &'a str, keroname: &'a str) -> Self {
        Self {
            text,
            username,
            selfname,
            keroname,
            lastghostname: "",
            lastobjectname: "",
            screen_width: 1024,
            screen_height: 768,
        }
    }

    pub fn with_screen(mut self, width: u32, height: u32) -> Self {
        self.screen_width = width;
        self.screen_height = height;
        self
    }

    pub fn with_last_ghost(mut self, last_ghost: &'a str, last_object: &'a str) -> Self {
        self.lastghostname = last_ghost;
        self.lastobjectname = last_object;
        self
    }
}

pub fn expand_sakura_script_env(params: Expand_sakura_script_envParams<'_>) -> String {
    let now = chrono::Local::now();
    use chrono::Datelike;
    use chrono::Timelike;

    let text = params.text();
    let username = params.username();
    let selfname = params.selfname();
    let keroname = params.keroname();

    let mut result = text.to_string();

    // Replace %property[...] queries
    while let Some(start) = result.find("%property[") {
        if let Some(end) = result[start..].find(']') {
            let query = &result[start + 10..start + end];
            let val = match query {
                "username" => username.to_string(),
                "currentghost.name" | "name" => selfname.to_string(),
                "keroname" => keroname.to_string(),
                "system.year" => now.year().to_string(),
                "system.month" => now.month().to_string(),
                "system.day" => now.day().to_string(),
                "system.hour" => now.hour().to_string(),
                "system.minute" => now.minute().to_string(),
                "system.second" => now.second().to_string(),
                _ => String::new(),
            };
            result.replace_range(start..start + end + 1, &val);
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
    result = result.replace("%year", &now.year().to_string());
    result = result.replace("%month", &now.month().to_string());
    result = result.replace("%day", &now.day().to_string());
    result = result.replace("%hour", &now.hour().to_string());
    result = result.replace("%minute", &format!("{:02}", now.minute()));
    result = result.replace("%second", &format!("{:02}", now.second()));
    let pick_static = |words: &[&str]| -> String {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map(|d| d.subsec_nanos() as usize)
            .unwrap_or(0);
        words[nanos % words.len()].to_string()
    };

    while result.contains("%me") {
        result = result.replacen(
            "%me",
            &pick_static(&[
                "カレーライス",
                "ケーキ",
                "ポッキー",
                "おでん",
                "りんご",
                "ラーメン",
            ]),
            1,
        );
    }
    while result.contains("%mp") {
        result = result.replacen(
            "%mp",
            &pick_static(&["秋葉原", "モスクワ", "公園", "海", "新宿"]),
            1,
        );
    }
    while result.contains("%mh") {
        result = result.replacen(
            "%mh",
            &pick_static(&["コンビニ", "八百屋", "喫茶店", "松屋", "東急ハンズ"]),
            1,
        );
    }
    while result.contains("%mc") {
        result = result.replacen(
            "%mc",
            &pick_static(&["マイクロソフト", "ソニー", "富士通", "シャープ"]),
            1,
        );
    }
    while result.contains("%mt") {
        result = result.replacen(
            "%mt",
            &pick_static(&["ビンタ", "キン肉バスター", "蹴り", "真空竜巻旋風脚"]),
            1,
        );
    }
    while result.contains("%mz") {
        result = result.replacen(
            "%mz",
            &pick_static(&["パソコン", "タブレット", "湯呑み", "ディスプレイ"]),
            1,
        );
    }
    while result.contains("%ml") {
        result = result.replacen("%ml", &pick_static(&["仲間", "人類"]), 1);
    }
    while result.contains("%dms") {
        result = result.replacen(
            "%dms",
            &pick_static(&["意外と近くにいた宇宙人", "食べられない大根"]),
            1,
        );
    }

    result = result.replace("%ms", selfname);
    result = result.replace("%mp", "0");
    result = result.replace("%mh", "0");
    result = result.replace("%me", "0");
    result = result.replace("%mt", "0");
    result = result.replace("%mc", "0");
    result = result.replace("%ml", "0");
    result = result.replace("%mz", "0");
    // %m? 単語-非限定環境変数クエリ [pct-m-q.md]
    if result.contains("%m?") {
        let words = ["なない", "さくら", "うにゅう", "まゆら", "せりこ"];
        while result.contains("%m?") {
            let nanos = std::time::SystemTime::now()
                .duration_since(std::time::SystemTime::UNIX_EPOCH)
                .map(|d| d.subsec_nanos() as usize)
                .unwrap_or(0);
            let word = words[nanos % words.len()];
            result = result.replacen("%m?", word, 1);
        }
    }
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
        let expanded = expand_sakura_script_env(Expand_sakura_script_envParams::new(
            script, "TestUser", "Nanai", "Kero",
        ));
        assert!(expanded.contains("TestUser"));
        assert!(expanded.contains("Nanai"));
        assert!(expanded.contains("%property[unclosed"));
        assert!(!expanded.contains("%m?"));
        assert!(!expanded.contains("%*"));
    }
}
