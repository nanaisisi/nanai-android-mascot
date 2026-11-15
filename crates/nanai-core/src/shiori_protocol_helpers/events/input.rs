//! UKADOC公式仕様に準拠した標準SHIORIイベントリクエストビルダー群 (選択肢・アンカー・ユーザー入力・教え・通信等)

use crate::shiori_protocol_helpers::build_shiori_request_extended;

/// OnChoiceSelect イベントリクエスト構築
pub fn build_on_choice_select_request(choice_id: &str) -> String {
    let refs = vec![choice_id.to_string()];
    build_shiori_request_extended("GET", "OnChoiceSelect", &refs, None)
}

/// OnChoiceSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceSelectEx.md)
pub fn build_on_choice_select_ex_request(choice_id: &str, text: &str, extra_data: &str) -> String {
    let refs = vec![
        choice_id.to_string(),
        text.to_string(),
        extra_data.to_string(),
    ];
    build_shiori_request_extended("GET", "OnChoiceSelectEx", &refs, None)
}

/// OnChoiceTimeout イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceTimeout.md)
pub fn build_on_choice_timeout_request() -> String {
    build_shiori_request_extended("GET", "OnChoiceTimeout", &[], None)
}

/// OnAnchorSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorSelectEx.md)
pub fn build_on_anchor_select_ex_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorSelectEx", &refs, None)
}

/// OnChoiceEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceEnter.md)
pub fn build_on_choice_enter_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnChoiceEnter", &refs, None)
}

/// OnChoiceHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceHover.md)
pub fn build_on_choice_hover_request(choice_id: &str, text: &str) -> String {
    let refs = vec![choice_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnChoiceHover", &refs, None)
}

/// OnAnchorEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorEnter.md)
pub fn build_on_anchor_enter_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorEnter", &refs, None)
}

/// OnAnchorHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorHover.md)
pub fn build_on_anchor_hover_request(anchor_id: &str, text: &str) -> String {
    let refs = vec![anchor_id.to_string(), text.to_string()];
    build_shiori_request_extended("GET", "OnAnchorHover", &refs, None)
}

/// OnMenuExec プラグインイベントリクエスト構築 (ukadoc-spec/list/plugin-event/plugin-event/OnMenuExec.md)
pub fn build_on_menu_exec_event_request(menu_name: &str) -> String {
    let refs = vec![menu_name.to_string()];
    build_shiori_request_extended("GET", "OnMenuExec", &refs, None)
}

/// OnTeach イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeach.md)
pub fn build_on_teach_request(taught_str: &str) -> String {
    let refs = vec![taught_str.to_string()];
    build_shiori_request_extended("GET", "OnTeach", &refs, None)
}

/// OnCommunicate イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicate.md)
pub fn build_on_communicate_request(sender_name: &str, message: &str) -> String {
    let refs = vec![sender_name.to_string(), message.to_string()];
    build_shiori_request_extended("GET", "OnCommunicate", &refs, None)
}

/// OnUserInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
pub fn build_on_user_input_request(input_id: &str, input_value: &str) -> String {
    let refs = vec![input_id.to_string(), input_value.to_string()];
    build_shiori_request_extended("GET", "OnUserInput", &refs, None)
}

/// OnTextAreaInput イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInput.md)
pub fn build_on_text_area_input_request(input_id: &str, text_value: &str) -> String {
    let refs = vec![input_id.to_string(), text_value.to_string()];
    build_shiori_request_extended("GET", "OnTextAreaInput", &refs, None)
}

/// OnUserInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
pub fn build_on_user_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended("GET", "OnUserInputCancel", &refs, None)
}

/// OnTeachInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
pub fn build_on_teach_input_cancel_request() -> String {
    build_shiori_request_extended("GET", "OnTeachInputCancel", &[], None)
}

/// OnCommunicateInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel.md)
pub fn build_on_communicate_input_cancel_request() -> String {
    build_shiori_request_extended("GET", "OnCommunicateInputCancel", &[], None)
}

/// OnTextAreaInputCancel イベントリクエスト構築 (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInputCancel.md)
pub fn build_on_text_area_input_cancel_request(input_id: &str) -> String {
    let refs = vec![input_id.to_string()];
    build_shiori_request_extended("GET", "OnTextAreaInputCancel", &refs, None)
}
