use super::evaluator::{evaluate_property_query, evaluate_property_query_with_context};

#[test]
fn test_property_evaluation() {
    assert_eq!(
        evaluate_property_query_with_context("currentghost.name", Some("Emily"), Some(1)),
        "Emily"
    );
    assert_eq!(
        evaluate_property_query_with_context("ghostlist.count", Some("Emily"), Some(1)),
        "1"
    );
    assert_eq!(evaluate_property_query("currentghost.name"), "");
    assert_eq!(evaluate_property_query("ghostlist.count"), "0");
    assert_eq!(
        evaluate_property_query("baseware.name"),
        "Nanai Android Mascot"
    );
    assert_eq!(
        evaluate_property_query("baseware.version"),
        env!("CARGO_PKG_VERSION")
    );
    assert_eq!(
        evaluate_property_query("system.baseware.version"),
        env!("CARGO_PKG_VERSION")
    );
    assert_eq!(evaluate_property_query("currentghost.name"), "");
    assert_eq!(evaluate_property_query("username"), "");
    assert_eq!(evaluate_property_query("shiori.version"), "3.0");
    assert_eq!(
        evaluate_property_query("shiori.name"),
        "SHIORI/3.0 Standard"
    );
    assert_eq!(evaluate_property_query("shiori.encoding"), "UTF-8");
    let now = chrono::Local::now();
    use chrono::Datelike;
    use chrono::Timelike;
    assert_eq!(
        evaluate_property_query("system.year"),
        now.year().to_string()
    );
    assert_eq!(
        evaluate_property_query("system.month"),
        now.month().to_string()
    );
    assert_eq!(evaluate_property_query("system.day"), now.day().to_string());
    assert_eq!(
        evaluate_property_query("system.hour"),
        now.hour().to_string()
    );
    assert_eq!(
        evaluate_property_query("system.minute"),
        now.minute().to_string()
    );
    assert_eq!(
        evaluate_property_query("system.second"),
        now.second().to_string()
    );
    assert_eq!(evaluate_property_query("system.cursor.pos"), "0,0");
    assert_eq!(evaluate_property_query("system.theme.app.mode"), "dark");
    assert_eq!(evaluate_property_query("system.theme.os.mode"), "dark");
    assert_eq!(evaluate_property_query("system.dnd.mode"), "normal");
    assert_eq!(evaluate_property_query("system.monitor.count"), "1");
    assert_eq!(evaluate_property_query("system.disk.count"), "1");
    assert_eq!(
        evaluate_property_query("system.os.name"),
        std::env::consts::OS
    );
    assert_eq!(
        evaluate_property_query("system.cpu.name"),
        std::env::consts::ARCH
    );
    assert!(!evaluate_property_query("system.memory.total").is_empty());
    assert!(!evaluate_property_query("system.power.source").is_empty());
    assert!(!evaluate_property_query("system.power.battery.percent").is_empty());
    assert_eq!(evaluate_property_query("system.network.state"), "online");
    assert_eq!(
        evaluate_property_query("system.monitor.index(0).rect"),
        "0,0,1920,1080"
    );
    assert!(!evaluate_property_query("system.disk.index(0).free").is_empty());
    assert_eq!(evaluate_property_query("update_time"), "0");
    assert_eq!(evaluate_property_query("sakura.bind.menu"), "auto");
    assert_eq!(evaluate_property_query("kero.bind.menu"), "auto");
    assert_eq!(evaluate_property_query("char0.bind.menu"), "auto");
    assert_eq!(
        evaluate_property_query("definedsurfaceonlybutton.caption"),
        "1"
    );
    assert_eq!(
        evaluate_property_query("collisionvisiblebutton.caption"),
        "1"
    );
    assert_eq!(evaluate_property_query("balloonlist.count"), "0");
    assert_eq!(evaluate_property_query("balloonlist.index(0).name"), "");
    assert_eq!(evaluate_property_query("currentghost.balloon.count"), "0");
    assert_eq!(evaluate_property_query("currentghost.balloon.name"), "");
    assert_eq!(
        evaluate_property_query("currentghost.balloon.mousecursor.arrow"),
        ""
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.scope(0).rect"),
        "0,0,280,100"
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.scope(0).validwidth"),
        "260"
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.scope(0).validheight"),
        "80"
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.scope(0).scaling"),
        "100"
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.scope(0).vertical"),
        "0"
    );
    assert_eq!(evaluate_property_query("history.balloon.count"), "0");
    assert_eq!(evaluate_property_query("history.balloon.index(0).name"), "");
    assert_eq!(
        evaluate_property_query("currentghost.seriko.surfacelist.defined"),
        "0,1,10"
    );
    assert_eq!(
        evaluate_property_query("currentghost.seriko.surfacelist.all"),
        "0,1,10"
    );
    assert_eq!(
        evaluate_property_query("callsstpsendboxbutton.caption"),
        "1"
    );
    assert_eq!(evaluate_property_query("updatefmobutton.caption"), "1");
    assert_eq!(
        evaluate_property_query("switchlocalsstpbutton.caption"),
        "1"
    );
    assert_eq!(
        evaluate_property_query("switchremotesstpbutton.caption"),
        "1"
    );
    assert_eq!(evaluate_property_query("switchreloadbutton.caption"), "1");
    assert_eq!(evaluate_property_query("historyrootbutton.caption"), "1");
    assert_eq!(evaluate_property_query("sntpbutton.caption"), "1");
    assert_eq!(evaluate_property_query("sakura.menu"), "auto");
    assert_eq!(evaluate_property_query("kero.menu"), "auto");
    assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");
    assert_eq!(evaluate_property_query("menu.font.height"), "12");
    assert_eq!(evaluate_property_query("menu.frame.color.r"), "0");
    assert_eq!(evaluate_property_query("menu.frame.color.g"), "0");
    assert_eq!(evaluate_property_query("menu.frame.color.b"), "0");
    assert_eq!(evaluate_property_query("menu.background.font.color.r"), "0");
    assert_eq!(
        evaluate_property_query("menu.foreground.font.color.r"),
        "255"
    );
    assert_eq!(evaluate_property_query("menu.disable.font.color.r"), "128");
    assert_eq!(evaluate_property_query("menu.separator.color.r"), "192");
    assert_eq!(evaluate_property_query("sakura.menuitem0"), "");
    assert_eq!(evaluate_property_query("kero.menuitemex1"), "");
    assert_eq!(
        evaluate_property_query("unknown.prop"),
        "(unknown property: unknown.prop)"
    );
}
