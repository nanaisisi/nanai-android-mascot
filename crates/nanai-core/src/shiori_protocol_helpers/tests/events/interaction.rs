use crate::shiori_protocol_helpers::*;

#[test]
fn test_mouse_choice_input_events() {
    let click_req = build_on_mouse_click_request(Build_on_mouse_click_requestParams {
        x: 50,
        y: 60,
        scope_id: 0,
        collision_name: "head",
        button: 0,
    });
    assert!(click_req.contains("ID: OnMouseClick"));
    assert!(click_req.contains("Reference4: head"));

    let choice_req = build_on_choice_select_request("choice_01");
    assert!(choice_req.contains("ID: OnChoiceSelect"));
    assert!(choice_req.contains("Reference0: choice_01"));

    let choice_timeout = build_on_choice_timeout_request();
    assert!(choice_timeout.contains("ID: OnChoiceTimeout"));

    let anchor_ex = build_on_anchor_select_ex_request("anchor_1", "Text");
    assert!(anchor_ex.contains("ID: OnAnchorSelectEx"));
    assert!(anchor_ex.contains("Reference0: anchor_1"));
    assert!(anchor_ex.contains("Reference1: Text"));

    let choice_enter = build_on_choice_enter_request("c1", "Choice 1");
    assert!(choice_enter.contains("ID: OnChoiceEnter"));

    let choice_hover = build_on_choice_hover_request("c1", "Choice 1");
    assert!(choice_hover.contains("ID: OnChoiceHover"));

    let anchor_enter = build_on_anchor_enter_request("a1", "Anchor 1");
    assert!(anchor_enter.contains("ID: OnAnchorEnter"));

    let anchor_hover = build_on_anchor_hover_request("a1", "Anchor 1");
    assert!(anchor_hover.contains("ID: OnAnchorHover"));

    let teach_req = build_on_teach_request("apple is a fruit");
    assert!(teach_req.contains("ID: OnTeach"));
    assert!(teach_req.contains("Reference0: apple is a fruit"));

    let comm_req = build_on_communicate_request("Sakura", "Hi Emily");
    assert!(comm_req.contains("ID: OnCommunicate"));
    assert!(comm_req.contains("Reference0: Sakura"));
    assert!(comm_req.contains("Reference1: Hi Emily"));

    let input_req = build_on_user_input_request("input_name", "Nanai");
    assert!(input_req.contains("ID: OnUserInput"));
    assert!(input_req.contains("Reference0: input_name"));
    assert!(input_req.contains("Reference1: Nanai"));

    let textarea_req = build_on_text_area_input_request("memo_area", "Hello world");
    assert!(textarea_req.contains("ID: OnTextAreaInput"));
    assert!(textarea_req.contains("Reference0: memo_area"));
    assert!(textarea_req.contains("Reference1: Hello world"));

    let input_cancel = build_on_user_input_cancel_request("input_name");
    assert!(input_cancel.contains("ID: OnUserInputCancel"));

    let teach_cancel = build_on_teach_input_cancel_request();
    assert!(teach_cancel.contains("ID: OnTeachInputCancel"));

    let comm_cancel = build_on_communicate_input_cancel_request();
    assert!(comm_cancel.contains("ID: OnCommunicateInputCancel"));

    let textarea_cancel = build_on_text_area_input_cancel_request("memo_area");
    assert!(textarea_cancel.contains("ID: OnTextAreaInputCancel"));

    let gesture_req = build_on_mouse_gesture_request("circle_cw", 0);
    assert!(gesture_req.contains("ID: OnMouseGesture"));

    let wheel_req = build_on_mouse_wheel_request(Build_on_mouse_wheel_requestParams {
        x: 100,
        y: 100,
        wheel_delta: 120,
        collision: "head",
        scope_id: 0,
    });
    assert!(wheel_req.contains("ID: OnMouseWheel"));

    let drag_start = build_on_mouse_drag_start_request(Build_on_mouse_drag_start_requestParams {
        x: 10,
        y: 20,
        scope_id: 0,
    });
    assert!(drag_start.contains("ID: OnMouseDragStart"));

    let drag_end = build_on_mouse_drag_end_request(Build_on_mouse_drag_end_requestParams {
        x: 50,
        y: 50,
        scope_id: 0,
    });
    assert!(drag_end.contains("ID: OnMouseDragEnd"));

    let mouse_ex = build_on_mouse_click_ex_request(Build_on_mouse_click_ex_requestParams {
        x: 10,
        y: 20,
        scope_id: 0,
        collision_name: "head",
        button: 0,
        key_state: 1,
    });
    assert!(mouse_ex.contains("ID: OnMouseClickEx"));

    let choice_ex = build_on_choice_select_ex_request(Build_on_choice_select_ex_requestParams {
        choice_id: "opt1",
        text: "Choice Text",
        extra_data: "extra",
    });
    assert!(choice_ex.contains("ID: OnChoiceSelectEx"));
}
