//! SakuraScript Environment Variable Interpolation (%username, %selfname, %hour, etc.)

use chrono::{Datelike, Local, Timelike};

pub fn expand_sakura_script_env(
    text: &str,
    username: &str,
    selfname: &str,
    keroname: &str,
) -> String {
    let now = Local::now();
    let mut result = text.to_string();
    result = result.replace("%username", username);
    result = result.replace("%selfname", selfname);
    result = result.replace("%keroname", keroname);
    result = result.replace("%year", &now.year().to_string());
    result = result.replace("%month", &now.month().to_string());
    result = result.replace("%day", &now.day().to_string());
    result = result.replace("%hour", &now.hour().to_string());
    result = result.replace("%minute", &now.minute().to_string());
    result = result.replace("%second", &now.second().to_string());
    result
}
