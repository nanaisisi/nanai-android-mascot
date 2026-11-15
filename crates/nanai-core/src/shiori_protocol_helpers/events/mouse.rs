//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (マウス操作・ジェスチャ等)

use crate::shiori_protocol_helpers::{build_shiori_request_extended, Build_shiori_request_extendedParams};

/// OnMouseClick イベントリクエスト構築
pub fn build_on_mouse_click_request(
    x: i32,
    y: i32,
    scope_id: i32,
    collision_name: &str,
    button: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        "0".to_string(),
        scope_id.to_string(),
        collision_name.to_string(),
        button.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseClick",
        references: &refs,
        params: None,
    })
}

/// OnMouseClickEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseClickEx.md)
pub fn build_on_mouse_click_ex_request(
    x: i32,
    y: i32,
    scope_id: i32,
    collision_name: &str,
    button: i32,
    key_state: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        "0".to_string(),
        scope_id.to_string(),
        collision_name.to_string(),
        button.to_string(),
        key_state.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseClickEx",
        references: &refs,
        params: None,
    })
}

/// OnMouseGesture イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseGesture.md)
pub fn build_on_mouse_gesture_request(gesture: &str, scope_id: i32) -> String {
    let refs = vec![gesture.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseGesture",
        references: &refs,
        params: None,
    })
}

/// OnMouseWheel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseWheel.md)
pub fn build_on_mouse_wheel_request(
    x: i32,
    y: i32,
    wheel_delta: i32,
    collision: &str,
    scope_id: i32,
) -> String {
    let refs = vec![
        x.to_string(),
        y.to_string(),
        wheel_delta.to_string(),
        collision.to_string(),
        scope_id.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseWheel",
        references: &refs,
        params: None,
    })
}

/// OnMouseDragStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragStart.md)
pub fn build_on_mouse_drag_start_request(x: i32, y: i32, scope_id: i32) -> String {
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseDragStart",
        references: &refs,
        params: None,
    })
}

/// OnMouseDragEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragEnd.md)
pub fn build_on_mouse_drag_end_request(x: i32, y: i32, scope_id: i32) -> String {
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseDragEnd",
        references: &refs,
        params: None,
    })
}
