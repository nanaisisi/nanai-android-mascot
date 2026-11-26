//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (マウス操作・ジェスチャ等)

use super::super::{Build_shiori_request_extendedParams, build_shiori_request_extended};

#[allow(non_camel_case_types)]
pub struct Build_on_mouse_click_requestParams<'a> {
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) scope_id: i32,
    pub(crate) collision_name: &'a str,
    pub(crate) button: i32,
}

#[allow(dead_code)]
impl<'a> Build_on_mouse_click_requestParams<'a> {
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }
    pub fn collision_name(&self) -> &'a str {
        self.collision_name
    }
    pub fn button(&self) -> i32 {
        self.button
    }
}

/// OnMouseClick イベントリクエスト構築
pub fn build_on_mouse_click_request(params: Build_on_mouse_click_requestParams<'_>) -> String {
    let x = params.x();
    let y = params.y();
    let scope_id = params.scope_id();
    let collision_name = params.collision_name();
    let button = params.button();
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
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) scope_id: i32,
    pub(crate) collision_name: &'a str,
    pub(crate) button: i32,
    pub(crate) key_state: i32,
}

#[allow(dead_code)]
impl<'a> Build_on_mouse_click_ex_requestParams<'a> {
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }
    pub fn collision_name(&self) -> &'a str {
        self.collision_name
    }
    pub fn button(&self) -> i32 {
        self.button
    }
    pub fn key_state(&self) -> i32 {
        self.key_state
    }
}

/// OnMouseClickEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseClickEx.md)
pub fn build_on_mouse_click_ex_request(
    params: Build_on_mouse_click_ex_requestParams<'_>,
) -> String {
    let x = params.x();
    let y = params.y();
    let scope_id = params.scope_id();
    let collision_name = params.collision_name();
    let button = params.button();
    let key_state = params.key_state();
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
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) wheel_delta: i32,
    pub(crate) collision: &'a str,
    pub(crate) scope_id: i32,
}

#[allow(dead_code)]
impl<'a> Build_on_mouse_wheel_requestParams<'a> {
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn wheel_delta(&self) -> i32 {
        self.wheel_delta
    }
    pub fn collision(&self) -> &'a str {
        self.collision
    }
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }
}

/// OnMouseWheel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseWheel.md)
pub fn build_on_mouse_wheel_request(params: Build_on_mouse_wheel_requestParams<'_>) -> String {
    let x = params.x();
    let y = params.y();
    let wheel_delta = params.wheel_delta();
    let collision = params.collision();
    let scope_id = params.scope_id();
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
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) scope_id: i32,
}

#[allow(dead_code)]
impl Build_on_mouse_drag_start_requestParams {
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }
}

/// OnMouseDragStart イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragStart.md)
pub fn build_on_mouse_drag_start_request(
    params: Build_on_mouse_drag_start_requestParams,
) -> String {
    let x = params.x();
    let y = params.y();
    let scope_id = params.scope_id();
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
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) scope_id: i32,
}

#[allow(dead_code)]
impl Build_on_mouse_drag_end_requestParams {
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }
}

/// OnMouseDragEnd イベントリクエスト構築 (ukadoc-spec/list/shiori-event/mouse/OnMouseDragEnd.md)
pub fn build_on_mouse_drag_end_request(params: Build_on_mouse_drag_end_requestParams) -> String {
    let x = params.x();
    let y = params.y();
    let scope_id = params.scope_id();
    let refs = vec![x.to_string(), y.to_string(), scope_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMouseDragEnd",
        references: &refs,
        params: None,
    })
}
