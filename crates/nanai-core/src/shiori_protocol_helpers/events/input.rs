//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (選択肢・アンカー・ユーザー入力・教え・通信等)

use crate::shiori_protocol_helpers::{
    Build_shiori_request_extendedParams, build_shiori_request_extended,
};

/// OnChoiceSelect イベントリクエスト構築
pub fn build_on_choice_select_request(choice_id: &str) -> String {
    let refs = vec![choice_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnChoiceSelect",
        references: &refs,
        params: None,
    })
}

/// OnChoiceSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceSelectEx.md)
pub fn build_on_choice_select_ex_request(choice_id: &str, text: &str, extra_data: &str) -> String {
    let refs = vec![
        choice_id.to_string(),
        text.to_string(),
        extra_data.to_string(),
    ];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnChoiceSelectEx",
        references: &refs,
        params: None,
    })
}

/// OnChoiceTimeout イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceTimeout.md)
pub fn build_on_choice_timeout_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnChoiceTimeout",
        references: &[],
        params: None,
    })
}

/// OnAnchorSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorSelectEx.md)
pub fn build_on_anchor_select_ex_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnAnchorSelectEx",
        references: &refs,
        params: None,
    })
}

/// OnChoiceEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceEnter.md)
pub fn build_on_choice_enter_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnChoiceEnter",
        references: &refs,
        params: None,
    })
}

/// OnChoiceHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceHover.md)
pub fn build_on_choice_hover_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnChoiceHover",
        references: &refs,
        params: None,
    })
}

/// OnAnchorEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorEnter.md)
pub fn build_on_anchor_enter_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnAnchorEnter",
        references: &refs,
        params: None,
    })
}

/// OnAnchorHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorHover.md)
pub fn build_on_anchor_hover_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnAnchorHover",
        references: &refs,
        params: None,
    })
}

/// OnMenuExec プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnMenuExec.md)
pub fn build_on_menu_exec_event_request(menu_name: &str) -> String {
    let refs = vec![menu_name.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnMenuExec",
        references: &refs,
        params: None,
    })
}

/// OnTeach イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
pub fn build_on_teach_request(taught_str: &str) -> String {
    let refs = vec![taught_str.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnTeach",
        references: &refs,
        params: None,
    })
}

/// OnCommunicate イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicate.md)
pub fn build_on_communicate_request(sender_name: &str, message: &str) -> String {
    let refs = vec![sender_name.to_string(), message.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnCommunicate",
        references: &refs,
        params: None,
    })
}

/// OnUserInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
pub fn build_on_user_input_request(input_id: &str, input_value: &str) -> String {
    let refs = vec![input_id.to_string(), input_value.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUserInput",
        references: &refs,
        params: None,
    })
}

/// OnTextAreaInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInput.md)
pub fn build_on_text_area_input_request(input_id: &str, text_value: &str) -> String {
    let refs = vec![input_id.to_string(), text_value.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnTextAreaInput",
        references: &refs,
        params: None,
    })
}

/// OnUserInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
pub fn build_on_user_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnUserInputCancel",
        references: &refs,
        params: None,
    })
}

/// OnTeachInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
pub fn build_on_teach_input_cancel_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnTeachInputCancel",
        references: &[],
        params: None,
    })
}

/// OnCommunicateInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel.md)
pub fn build_on_communicate_input_cancel_request() -> String {
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnCommunicateInputCancel",
        references: &[],
        params: None,
    })
}

/// OnTextAreaInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInputCancel.md)
pub fn build_on_text_area_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended(Build_shiori_request_extendedParams {
        method: "GET",
        event_id: "OnTextAreaInputCancel",
        references: &refs,
        params: None,
    })
}
