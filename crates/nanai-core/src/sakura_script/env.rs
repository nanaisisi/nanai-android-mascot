//! さくらスクリプト 実行時環境変数コンテキストおよび展開処理

use serde::{Deserialize, Serialize};
use tsify::Tsify;

/// 実行時環境変数コンテキスト (UKADOC仕様: さくらスクリプト 環境変数)
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct SakuraEnvContext {
    pub username: String,
    pub selfname: String,
    pub keroname: String,
    pub year: u32,
    pub month: u32,
    pub day: u32,
    pub hour: u32,
    pub minute: u32,
    pub second: u32,
    pub system_os: String,
    pub system_version: String,
}

impl Default for SakuraEnvContext {
    fn default() -> Self {
        Self {
            username: "User".to_string(),
            selfname: "Sakura".to_string(),
            keroname: "Kero".to_string(),
            year: 2026,
            month: 10,
            day: 24,
            hour: 12,
            minute: 0,
            second: 0,
            system_os: "Android".to_string(),
            system_version: "1.0.0".to_string(),
        }
    }
}

/// さくらスクリプト内の環境変数 (%username, %selfname, %keroname, %system.os 等) を展開
pub fn expand_sakura_environment_variables(script: &str, ctx: &SakuraEnvContext) -> String {
    let mut result = script.to_string();
    result = result.replace("%username", &ctx.username);
    result = result.replace("%user", &ctx.username);
    result = result.replace("%selfname[0]", &ctx.selfname);
    result = result.replace("%selfname[1]", &ctx.keroname);
    result = result.replace("%selfname", &ctx.selfname);
    result = result.replace("%keroname", &ctx.keroname);
    result = result.replace("%year", &ctx.year.to_string());
    result = result.replace("%month", &ctx.month.to_string());
    result = result.replace("%day", &ctx.day.to_string());
    result = result.replace("%hour", &ctx.hour.to_string());
    result = result.replace("%minute", &ctx.minute.to_string());
    result = result.replace("%second", &ctx.second.to_string());
    result = result.replace("%system.os", &ctx.system_os);
    result = result.replace("%system.version", &ctx.system_version);
    result
}
