use crate::shiori_protocol_helpers::*;

#[test]
fn test_network_and_file_events() {
    let biff_req = build_on_biff_request();
    assert!(biff_req.contains("ID: OnBIFFBegin"));

    let biff_comp = build_on_biff_complete_request(5, 10240);
    assert!(biff_comp.contains("ID: OnBIFFComplete"));
    assert!(biff_comp.contains("Reference0: 5"));

    let biff_fail = build_on_biff_failure_request("timeout");
    assert!(biff_fail.contains("ID: OnBIFFFailure"));

    let biff2_comp = build_on_biff2_complete_request(10, 2);
    assert!(biff2_comp.contains("ID: OnBIFF2Complete"));

    let drop_req = build_on_file_drop_request("/path/to/nar.nar");
    assert!(drop_req.contains("ID: OnFileDrop"));

    let drop_ex_req = build_on_file_drop_ex_request("/path/to/nar.nar", 1);
    assert!(drop_ex_req.contains("ID: OnFileDropEx"));

    let nar_req = build_on_nar_creating_request("ghost.nar");
    assert!(nar_req.contains("ID: OnNarCreating"));

    let wall_req = build_on_wallpaper_change_request("wallpaper.png");
    assert!(wall_req.contains("ID: OnWallpaperChange"));

    let headline_begin = build_on_headlinesense_begin_request("RSS Feed");
    assert!(headline_begin.contains("ID: OnHeadlinesenseBegin"));
}
