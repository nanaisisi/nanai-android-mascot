//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (マウス操作・ジェスチャ等)

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_click_requestParams<'a> {
    pub x: i32,
    pub y: i32,
    pub scope_id: i32,
    pub collision_name: &'a str,
    pub button: i32,
}

/// OnMouseClick イベントリクエスト構築
pub fn build_on_mouse_click_request(params: Build_on_mouse_click_requestParams<'_>) -> String {
    let x = params.x;
    let y = params.y;
    let scope_id = params.scope_id;
    let collision_name = params.collision_name;
    let button = params.button;
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

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_click_ex_requestParams<'a> {
    pub x: i32,
    pub y: i32,
    pub scope_id: i32,
    pub collision_name: &'a str,
    pub button: i32,
    pub key_state: i32,
}

/// OnMouseClickEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseClickEx.md)
pub fn build_on_mouse_click_ex_request(
    params: Build_on_mouse_click_ex_requestParams<'_>,
) -> String {
    let x = params.x;
    let y = params.y;
    let scope_id = params.scope_id;
    let collision_name = params.collision_name;
    let button = params.button;
    let key_state = params.key_state;
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

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_wheel_requestParams<'a> {
    pub x: i32,
    pub y: i32,
    pub wheel_delta: i32,
    pub collision: &'a str,
    pub scope_id: i32,
}

/// OnMouseWheel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseWheel.md)
pub fn build_on_mouse_wheel_request(params: Build_on_mouse_wheel_requestParams<'_>) -> String {
    let x = params.x;
    let y = params.y;
    let wheel_delta = params.wheel_delta;
    let collision = params.collision;
    let scope_id = params.scope_id;
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

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_drag_start_requestParams {
    pub x: i32,
    pub y: i32,
    pub scope_id: i32,
}

/// OnMouseDragStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragStart.md)
pub fn build_on_mouse_drag_start_request(
    params: Build_on_mouse_drag_start_requestParams,
) -> String {
    let x = params.x;
    let y = params.y;
    let scope_id = params.scope_id;
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseDragStart",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_drag_end_requestParams {
    pub x: i32,
    pub y: i32,
    pub scope_id: i32,
}

/// OnMouseDragEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragEnd.md)
pub fn build_on_mouse_drag_end_request(params: Build_on_mouse_drag_end_requestParams) -> String {
    let x = params.x;
    let y = params.y;
    let scope_id = params.scope_id;
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseDragEnd",
        references: &refs,
        params: None,
    })
}
