//! SakuraScript Environment Variable Interpolation (%username, %selfname, %dms, %ms, %mp, %mh, %me, %mt, %property[...], etc.)

use chrono::{Datelike, Local, Timelike};
use crate::shiori::property::evaluate_property_query;

pub fn expand_sakura_script_env(
    text: &str,
    username: &str,
    selfname: &str,
    keroname: &str,
) -> String {
    let now = Local::now();
    let mut result = text.to_string();

    // Replace %property[...] queries
    while let Some(start) = result.find("%property[") {
        if let Some(end) = result[start..].find(']') {
            let query = &result[start + 10..start + end];
            let val = evaluate_property_query(query);
            result.replace_range(start..start + end + 1, &val);
        } else {
            break;
        }
    }

    result = result.replace("%username", username);
    result = result.replace("%selfname", selfname);
    result = result.replace("%selfname2", selfname);
    result = result.replace("%keroname", keroname);
    result = result.replace("%year", &now.year().to_string());
    result = result.replace("%month", &now.month().to_string());
    result = result.replace("%day", &now.day().to_string());
    result = result.replace("%hour", &now.hour().to_string());
    result = result.replace("%minute", &now.minute().to_string());
    result = result.replace("%second", &now.second().to_string());
    result = result.replace("%dms", &now.timestamp_subsec_millis().to_string());
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
    result = result.replace("%*", "");
    result
}
