//! ゲームパッド接続・ボタン・軸移動イベントビルダー

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

/// OnGamepadConnected イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadConnected.md)
pub fn build_on_gamepad_connected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadConnected",
        references: &refs,
        params: None,
    })
}

/// OnGamepadDisconnected イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadDisconnected.md)
pub fn build_on_gamepad_disconnected_request(pad_index: i32) -> String {
    let refs = vec![pad_index.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadDisconnected",
        references: &refs,
        params: None,
    })
}

/// OnGamepadButtonDown イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadButtonDown.md)
pub fn build_on_gamepad_button_down_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadButtonDown",
        references: &refs,
        params: None,
    })
}

/// OnGamepadButtonUp イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadButtonUp.md)
pub fn build_on_gamepad_button_up_request(pad_index: i32, button_id: i32) -> String {
    let refs = vec![pad_index.to_string(), button_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadButtonUp",
        references: &refs,
        params: None,
    })
}

#[allow(non_camel_case_types)]
pub struct Build_on_gamepad_axis_move_requestParams {
    pub pad_index: i32,
    pub axis_id: i32,
    pub value: f64,
}

/// OnGamepadAxisMove イベントリクエスト構築 (ukadoc-spec/list/shiori-event/gamepad/OnGamepadAxisMove.md)
pub fn build_on_gamepad_axis_move_request(
    params: Build_on_gamepad_axis_move_requestParams,
) -> String {
    let pad_index = params.pad_index;
    let axis_id = params.axis_id;
    let value = params.value;
    let refs = vec![
        pad_index.to_string(),
        axis_id.to_string(),
        value.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnGamepadAxisMove",
        references: &refs,
        params: None,
    })
}
