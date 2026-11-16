//! さくらスクリプト 実行時環境変数コンテキストおよび展開処理

use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// 実行時環境変数コンテキスト (UKADOC仕様: さくらスクリプト 環境変数)
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct SakuraEnvContext {
    pub(crate) username: String,
    pub(crate) selfname: String,
    pub(crate) keroname: String,
    pub(crate) lastghostname: String,
    pub(crate) lastobjectname: String,
    pub(crate) screen_width: u32,
    pub(crate) screen_height: u32,
    pub(crate) year: u32,
    pub(crate) month: u32,
    pub(crate) day: u32,
    pub(crate) hour: u32,
    pub(crate) minute: u32,
    pub(crate) second: u32,
    pub(crate) system_os: String,
    pub(crate) system_version: String,
    pub(crate) random_words: Vec<String>,
    pub(crate) words_me: Vec<String>,
    pub(crate) words_mp: Vec<String>,
    pub(crate) words_mh: Vec<String>,
    pub(crate) words_mc: Vec<String>,
    pub(crate) words_mt: Vec<String>,
    pub(crate) words_mz: Vec<String>,
    pub(crate) words_ml: Vec<String>,
    pub(crate) words_dms: Vec<String>,
}

impl SakuraEnvContext {
    pub fn new(username: &str, selfname: &str, keroname: &str) -> Self {
        Self {
            username: username.to_string(),
            selfname: selfname.to_string(),
            keroname: keroname.to_string(),
            ..Default::default()
        }
    }

    pub fn with_screen(mut self, width: u32, height: u32) -> Self {
        self.screen_width = width;
        self.screen_height = height;
        self
    }

    pub fn with_last_ghost(mut self, last_ghost: &str, last_object: &str) -> Self {
        self.lastghostname = last_ghost.to_string();
        self.lastobjectname = last_object.to_string();
        self
    }

    pub fn username(&self) -> &str {
        &self.username
    }

    pub fn selfname(&self) -> &str {
        &self.selfname
    }

    pub fn keroname(&self) -> &str {
        &self.keroname
    }

    pub fn lastghostname(&self) -> &str {
        &self.lastghostname
    }

    pub fn lastobjectname(&self) -> &str {
        &self.lastobjectname
    }

    pub fn screen_width(&self) -> u32 {
        self.screen_width
    }

    pub fn screen_height(&self) -> u32 {
        self.screen_height
    }

    pub fn year(&self) -> u32 {
        self.year
    }

    pub fn month(&self) -> u32 {
        self.month
    }

    pub fn day(&self) -> u32 {
        self.day
    }

    pub fn hour(&self) -> u32 {
        self.hour
    }

    pub fn minute(&self) -> u32 {
        self.minute
    }

    pub fn second(&self) -> u32 {
        self.second
    }

    pub fn system_os(&self) -> &str {
        &self.system_os
    }

    pub fn system_version(&self) -> &str {
        &self.system_version
    }
}

impl Default for SakuraEnvContext {
    fn default() -> Self {
        let now = chrono::Local::now();
        use chrono::Datelike;
        use chrono::Timelike;
        Self {
            username: "User".to_string(),
            selfname: "Sakura".to_string(),
            keroname: "Kero".to_string(),
            lastghostname: String::new(),
            lastobjectname: String::new(),
            screen_width: 1024,
            screen_height: 768,
            year: now.year() as u32,
            month: now.month(),
            day: now.day(),
            hour: now.hour(),
            minute: now.minute(),
            second: now.second(),
            system_os: if cfg!(target_os = "android") {
                "Android".to_string()
            } else if cfg!(target_os = "windows") {
                "Windows".to_string()
            } else if cfg!(target_os = "macos") {
                "macOS".to_string()
            } else if cfg!(target_arch = "wasm32") {
                "Web".to_string()
            } else {
                "Linux".to_string()
            },
            system_version: "1.0.0".to_string(),
            random_words: vec![
                "なない".to_string(),
                "さくら".to_string(),
                "うにゅう".to_string(),
                "まゆら".to_string(),
                "せりこ".to_string(),
            ],
            words_me: vec![
                "カレーライス".to_string(),
                "ケーキ".to_string(),
                "ポッキー".to_string(),
                "おでん".to_string(),
                "りんご".to_string(),
                "ラーメン".to_string(),
            ],
            words_mp: vec![
                "秋葉原".to_string(),
                "モスクワ".to_string(),
                "公園".to_string(),
                "海".to_string(),
                "新宿".to_string(),
            ],
            words_mh: vec![
                "コンビニ".to_string(),
                "八百屋".to_string(),
                "喫茶店".to_string(),
                "松屋".to_string(),
                "東急ハンズ".to_string(),
            ],
            words_mc: vec![
                "マイクロソフト".to_string(),
                "ソニー".to_string(),
                "富士通".to_string(),
                "シャープ".to_string(),
            ],
            words_mt: vec![
                "ビンタ".to_string(),
                "キン肉バスター".to_string(),
                "蹴り".to_string(),
                "真空竜巻旋風脚".to_string(),
            ],
            words_mz: vec![
                "パソコン".to_string(),
                "タブレット".to_string(),
                "湯呑み".to_string(),
                "ディスプレイ".to_string(),
            ],
            words_ml: vec!["仲間".to_string(), "人類".to_string()],
            words_dms: vec![
                "意外と近くにいた宇宙人".to_string(),
                "食べられない大根".to_string(),
            ],
        }
    }
}

/// さくらスクリプト内の環境変数 (%username, %selfname, %keroname, %system.os, %*, %dms 等) を展開
pub fn expand_sakura_environment_variables(script: &str, ctx: &SakuraEnvContext) -> String {
    let mut result = script.to_string();

    // Preserve escaped \% before expanding environment variables
    result = result.replace(r"\%", "\u{E000}");

    result = result.replace("%username", ctx.username());
    result = result.replace("%user", ctx.username());
    result = result.replace("%selfname[0]", ctx.selfname());
    result = result.replace("%selfname[1]", ctx.keroname());
    result = result.replace("%selfname2", ctx.selfname());
    result = result.replace("%selfname", ctx.selfname());
    result = result.replace("%keroname", ctx.keroname());
    result = result.replace("%year", &ctx.year().to_string());
    result = result.replace("%month", &ctx.month().to_string());
    result = result.replace("%day", &ctx.day().to_string());
    result = result.replace("%hour", &ctx.hour().to_string());
    result = result.replace("%minute", &ctx.minute().to_string());
    result = result.replace("%second", &ctx.second().to_string());
    result = result.replace("%dms", "0");
    result = result.replace("%et", "0");
    result = result.replace("%exh", "0");
    result = result.replace("%wronghour", "0");
    result = result.replace("%lastghostname", ctx.lastghostname());
    result = result.replace("%lastobjectname", ctx.lastobjectname());
    result = result.replace("%screenwidth", &ctx.screen_width().to_string());
    result = result.replace("%screenheight", &ctx.screen_height().to_string());
    while result.contains("%me") {
        result = result.replacen("%me", &pick_word(&ctx.words_me, "カレーライス"), 1);
    }
    while result.contains("%mp") {
        result = result.replacen("%mp", &pick_word(&ctx.words_mp, "秋葉原"), 1);
    }
    while result.contains("%mh") {
        result = result.replacen("%mh", &pick_word(&ctx.words_mh, "コンビニ"), 1);
    }
    while result.contains("%mc") {
        result = result.replacen("%mc", &pick_word(&ctx.words_mc, "ソニー"), 1);
    }
    while result.contains("%mt") {
        result = result.replacen("%mt", &pick_word(&ctx.words_mt, "ビンタ"), 1);
    }
    while result.contains("%mz") {
        result = result.replacen("%mz", &pick_word(&ctx.words_mz, "パソコン"), 1);
    }
    while result.contains("%ml") {
        result = result.replacen("%ml", &pick_word(&ctx.words_ml, "仲間"), 1);
    }
    while result.contains("%dms") {
        result = result.replacen(
            "%dms",
            &pick_word(&ctx.words_dms, "意外と近くにいた宇宙人"),
            1,
        );
    }

    result = result.replace("%ms", ctx.selfname());
    result = result.replace("%mp", "0");
    result = result.replace("%mh", "0");
    result = result.replace("%me", "0");
    result = result.replace("%mt", "0");
    result = result.replace("%mc", "0");
    result = result.replace("%ml", "0");
    result = result.replace("%mz", "0");

    // %m? 単語-非限定環境変数クエリ (ランダム単語選択)
    while result.contains("%m?") {
        let word = if !ctx.random_words.is_empty() {
            let nanos = std::time::SystemTime::now()
                .duration_since(std::time::SystemTime::UNIX_EPOCH)
                .map(|d| d.subsec_nanos() as usize)
                .unwrap_or(0);
            &ctx.random_words[nanos % ctx.random_words.len()]
        } else {
            "なない"
        };
        result = result.replacen("%m?", word, 1);
    }

    result = result.replace("%*", "");
    result = result.replace("%system.os", ctx.system_os());
    result = result.replace("%system.version", ctx.system_version());

    // Restore escaped \% as literal %
    result = result.replace("\u{E000}", "%");
    result
}

fn pick_word(words: &[String], fallback: &str) -> String {
    if words.is_empty() {
        fallback.to_string()
    } else {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map(|d| d.subsec_nanos() as usize)
            .unwrap_or(0);
        words[nanos % words.len()].clone()
    }
}
