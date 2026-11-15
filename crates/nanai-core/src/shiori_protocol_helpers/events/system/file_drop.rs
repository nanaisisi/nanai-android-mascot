//! ファイルドロップ、NAR作成、壁紙・バルーン変更イベントビルダー

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

/// OnBalloonChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/balloon/OnBalloonChange.md)
pub fn build_on_balloon_change_request(balloon_name: &str) -> String {
    let refs = vec![balloon_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnBalloonChange",
        references: &refs,
        params: None,
    })
}

/// OnFileDrop イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnFileDrop.md)
pub fn build_on_file_drop_request(file_path: &str) -> String {
    let refs = vec![file_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnFileDrop",
        references: &refs,
        params: None,
    })
}

/// OnFileDropEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnFileDropEx.md)
pub fn build_on_file_drop_ex_request(file_path: &str, scope_id: i32) -> String {
    let refs = vec![file_path.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnFileDropEx",
        references: &refs,
        params: None,
    })
}

/// OnNarCreating イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnNarCreating.md)
pub fn build_on_nar_creating_request(nar_path: &str) -> String {
    let refs = vec![nar_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnNarCreating",
        references: &refs,
        params: None,
    })
}

/// OnWallpaperChange イベントリクエスト構築 (ukadoc-spec/list/shiori-event/file-drop/OnWallpaperChange.md)
pub fn build_on_wallpaper_change_request(wallpaper_path: &str) -> String {
    let refs = vec![wallpaper_path.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnWallpaperChange",
        references: &refs,
        params: None,
    })
}
