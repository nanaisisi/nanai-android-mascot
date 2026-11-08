/**
 * @file property_cookie.rs
 * @brief GetProperty, SetProperty, GetCookie, SetCookie 単体テスト
 */
use super::*;

#[test]
fn test_execute_property_and_cookie_commands() {
    let ctx = create_test_context();

    let res_prop = handle_execute_command("GetProperty[ghostlist.count]", &ctx);
    assert_eq!(res_prop.status, SstpStatusCode::Ok);
    assert_eq!(res_prop.additional_data, Some("2".to_string()));

    let res_prop_empty = handle_execute_command("GetProperty[]", &ctx);
    assert_eq!(res_prop_empty.status, SstpStatusCode::BadRequest);

    let res_set_prop = handle_execute_command("SetProperty[my.prop,val]", &ctx);
    assert_eq!(res_set_prop.status, SstpStatusCode::Ok);

    let res_set_prop_empty = handle_execute_command("SetProperty[]", &ctx);
    assert_eq!(res_set_prop_empty.status, SstpStatusCode::BadRequest);

    let res_cookie = handle_execute_command("GetCookie[user_token]", &ctx);
    assert_eq!(res_cookie.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie.additional_data, Some("abc123xyz".to_string()));

    let res_cookie_empty = handle_execute_command("GetCookie[]", &ctx);
    assert_eq!(res_cookie_empty.status, SstpStatusCode::BadRequest);

    let res_set_cookie = handle_execute_command("SetCookie[theme,dark]", &ctx);
    assert_eq!(res_set_cookie.status, SstpStatusCode::Ok);

    let res_set_cookie_empty = handle_execute_command("SetCookie[]", &ctx);
    assert_eq!(res_set_cookie_empty.status, SstpStatusCode::BadRequest);

    let res_prop_missing = handle_execute_command("GetProperty[nonexistent.prop]", &ctx);
    assert_eq!(res_prop_missing.status, SstpStatusCode::Ok);
    assert_eq!(res_prop_missing.additional_data, Some("".to_string()));

    let res_prop_lc = handle_execute_command("GetProperty[CURRENTGHOST.NAME]", &ctx);
    assert_eq!(res_prop_lc.status, SstpStatusCode::Ok);
    assert_eq!(res_prop_lc.additional_data, Some("Nanai Ghost".to_string()));

    let res_cookie_missing = handle_execute_command("GetCookie[nonexistent_token]", &ctx);
    assert_eq!(res_cookie_missing.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie_missing.additional_data, Some("".to_string()));

    let mut ctx_other_sender = ctx.clone();
    ctx_other_sender.sender = "UnknownSender".to_string();
    let res_cookie_other = handle_execute_command("GetCookie[user_token]", &ctx_other_sender);
    assert_eq!(res_cookie_other.status, SstpStatusCode::Ok);
    assert_eq!(res_cookie_other.additional_data, Some("".to_string()));

    // Reference によるパラメータ解決
    let mut ctx_ref = ctx.clone();
    ctx_ref
        .references
        .insert("Reference0".to_string(), "currentghost.name".to_string());
    let res_prop_ref = handle_execute_command("GetProperty", &ctx_ref);
    assert_eq!(res_prop_ref.status, SstpStatusCode::Ok);
    assert_eq!(
        res_prop_ref.additional_data,
        Some("Nanai Ghost".to_string())
    );
}
