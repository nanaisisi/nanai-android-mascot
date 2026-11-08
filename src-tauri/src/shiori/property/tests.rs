/**
 * @file tests.rs
 * @brief UKADOC Property System クエリ評価エンジンの単体テスト
 */
use super::evaluator::evaluate_property_query;

#[test]
fn test_property_evaluation() {
    assert_eq!(evaluate_property_query("ghostlist.count"), "1");
    assert_eq!(
        evaluate_property_query("baseware.name"),
        "Nanai Android Mascot"
    );
    assert_eq!(evaluate_property_query("currentghost.name"), "Mock Ghost");
    assert_eq!(evaluate_property_query("username"), "User");
    assert_eq!(evaluate_property_query("shiori.version"), "3.0");
    assert_eq!(
        evaluate_property_query("shiori.name"),
        "SHIORI/3.0 Standard"
    );
    assert_eq!(evaluate_property_query("shiori.encoding"), "UTF-8");
    assert_eq!(evaluate_property_query("system.year"), "2026");
    assert_eq!(evaluate_property_query("system.month"), "11");
    assert_eq!(evaluate_property_query("system.day"), "3");
    assert_eq!(evaluate_property_query("system.hour"), "12");
    assert_eq!(evaluate_property_query("system.minute"), "0");
    assert_eq!(evaluate_property_query("system.second"), "0");
    assert_eq!(evaluate_property_query("system.millisecond"), "0");
    assert_eq!(evaluate_property_query("system.dayofweek"), "2");
    assert_eq!(evaluate_property_query("system.cursor.pos"), "0,0");
    assert_eq!(evaluate_property_query("system.theme.app.mode"), "dark");
    assert_eq!(evaluate_property_query("system.theme.os.mode"), "dark");
    assert_eq!(evaluate_property_query("system.dnd.mode"), "none");
    assert_eq!(evaluate_property_query("system.monitor.count"), "1");
    assert_eq!(evaluate_property_query("system.disk.count"), "1");
    assert_eq!(evaluate_property_query("system.os.name"), "Linux");
    assert_eq!(evaluate_property_query("system.cpu.name"), "x86_64");
    assert_eq!(evaluate_property_query("system.memory.total"), "1024");
    assert_eq!(evaluate_property_query("system.power.state"), "ac");
    assert_eq!(evaluate_property_query("system.network.state"), "online");
    assert_eq!(
        evaluate_property_query("system.monitor.index(0).rect"),
        "0,0,1920,1080"
    );
    assert_eq!(
        evaluate_property_query("system.disk.index(0).free"),
        "100000"
    );
    assert_eq!(evaluate_property_query("update_time"), "0");
    assert_eq!(evaluate_property_query("sakura.bind.menu"), "");
    assert_eq!(evaluate_property_query("kero.bind.menu"), "");
    assert_eq!(
        evaluate_property_query("definedsurfaceonlybutton.caption"),
        "1"
    );
    assert_eq!(
        evaluate_property_query("collisionvisiblebutton.caption"),
        "1"
    );
    assert_eq!(evaluate_property_query("balloonlist.count"), "1");
    assert_eq!(
        evaluate_property_query("balloonlist.index(0).name"),
        "Default Balloon"
    );
    assert_eq!(evaluate_property_query("currentghost.balloon.count"), "1");
    assert_eq!(
        evaluate_property_query("currentghost.balloon.name"),
        "Default Balloon"
    );
    assert_eq!(
        evaluate_property_query("currentghost.balloon.mousecursor.arrow"),
        "arrow.cur"
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
    assert_eq!(evaluate_property_query("history.balloon.count"), "1");
    assert_eq!(
        evaluate_property_query("history.balloon.index(0).name"),
        "Default Balloon"
    );
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
