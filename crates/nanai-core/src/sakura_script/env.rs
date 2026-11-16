//! さくらスクリプト 実行時環境変数コンテキストおよび展開処理

use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// 実行時環境変数コンテキスト (UKADOC仕様: さくらスクリプト 環境変数)
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct SakuraEnvContext {
    pub(crate) username: String,
    pub(crate) selfname: String,
    pub(crate) keroname: String,
    pub(crate) year: u32,
    pub(crate) month: u32,
    pub(crate) day: u32,
    pub(crate) hour: u32,
    pub(crate) minute: u32,
    pub(crate) second: u32,
    pub(crate) system_os: String,
    pub(crate) system_version: String,
}

impl SakuraEnvContext {
    pub fn username(&self) -> &str {
        &self.username
    }

    pub fn selfname(&self) -> &str {
        &self.selfname
    }

    pub fn keroname(&self) -> &str {
        &self.keroname
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
    result = result.replace("%lastghostname", "");
    result = result.replace("%lastobjectname", "");
    result = result.replace("%screenwidth", "1024");
    result = result.replace("%screenheight", "768");
    result = result.replace("%ms", ctx.selfname());
    result = result.replace("%mp", "0");
    result = result.replace("%mh", "0");
    result = result.replace("%me", "0");
    result = result.replace("%mt", "0");
    result = result.replace("%mc", "0");
    result = result.replace("%ml", "0");
    result = result.replace("%mz", "0");
    result = result.replace("%m?", "");
    result = result.replace("%*", "");
    result = result.replace("%system.os", ctx.system_os());
    result = result.replace("%system.version", ctx.system_version());

    // Restore escaped \% as literal %
    result = result.replace("\u{E000}", "%");
    result
}
