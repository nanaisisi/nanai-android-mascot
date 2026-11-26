//! Android TYPE_APPLICATION_OVERLAY WebView 向け IPC ブリッジ

#![cfg_attr(not(target_os = "android"), allow(dead_code))]

use crate::commands;
use crate::common::state::AppState;
use serde::Deserialize;
use serde_json::Value;
use std::sync::OnceLock;
use tauri::Manager;

static OVERLAY_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

pub(crate) fn register_overlay_app_handle(app_handle: tauri::AppHandle) {
    let _ = OVERLAY_APP_HANDLE.set(app_handle);
}

fn get_overlay_app_handle() -> Option<tauri::AppHandle> {
    OVERLAY_APP_HANDLE.get().cloned()
}

fn parse_arg<T: for<'de> Deserialize<'de>>(args: &Value, key: &str) -> Result<T, String> {
    let val = args
        .get(key)
        .cloned()
        .ok_or_else(|| format!("Missing argument: {key}"))?;
    serde_json::from_value(val).map_err(|e| format!("Invalid argument '{key}': {e}"))
}

fn parse_opt_arg<T: for<'de> Deserialize<'de>>(args: &Value, key: &str) -> Option<T> {
    args.get(key)
        .filter(|v| !v.is_null())
        .and_then(|v| serde_json::from_value(v.clone()).ok())
}

fn to_json<T: serde::Serialize>(res: Result<T, String>) -> Result<Value, String> {
    res.and_then(|v| serde_json::to_value(v).map_err(|e| e.to_string()))
}

pub(crate) async fn dispatch_overlay_command(
    app_handle: tauri::AppHandle,
    cmd: &str,
    args: Value,
) -> Result<Value, String> {
    let state = app_handle.state::<AppState>();
    match cmd {
        "get_app_config" => to_json(commands::config::get_app_config(app_handle.clone())),
        "record_ghost_loaded" => {
            let name: String = parse_arg(&args, "name")?;
            to_json(commands::config::record_ghost_loaded(
                name,
                app_handle.clone(),
            ))
        }
        "scan_ghosts" => {
            let ghost_path: String = parse_arg(&args, "ghostPath")
                .or_else(|_| parse_arg(&args, "ghost_path"))
                .unwrap_or_else(|_| "assets/ghost".to_string());
            to_json(
                commands::shiori_status::scan_ghosts(state, ghost_path, app_handle.clone()).await,
            )
        }
        "get_ghost_info" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            to_json(commands::shell::ghost::get_ghost_info(ghost_name, app_handle.clone()).await)
        }
        "get_ghost_readme" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            to_json(commands::shell::ghost::get_ghost_readme(ghost_name, app_handle.clone()).await)
        }
        "get_ghost_terms" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            to_json(commands::shell::ghost::get_ghost_terms(ghost_name, app_handle.clone()).await)
        }
        "get_ghost_thumbnail" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            to_json(
                commands::shell::ghost::get_ghost_thumbnail(ghost_name, app_handle.clone()).await,
            )
        }
        "load_shiori_menu_bitmap" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            let shell_name: Option<String> =
                parse_opt_arg(&args, "shellName").or_else(|| parse_opt_arg(&args, "shell_name"));
            let rel_path: String =
                parse_arg(&args, "relPath").or_else(|_| parse_arg(&args, "rel_path"))?;
            to_json(
                commands::shell::ghost::load_shiori_menu_bitmap(
                    ghost_name,
                    shell_name,
                    rel_path,
                    app_handle.clone(),
                )
                .await,
            )
        }
        "get_makoto_translators" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            let shell_name: Option<String> =
                parse_opt_arg(&args, "shellName").or_else(|| parse_opt_arg(&args, "shell_name"));
            to_json(
                commands::shell::ghost::get_makoto_translators(
                    ghost_name,
                    shell_name,
                    app_handle.clone(),
                )
                .await,
            )
        }
        "shell_manifest" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            let shell_name: String = parse_opt_arg(&args, "shellName")
                .or_else(|| parse_opt_arg(&args, "shell_name"))
                .unwrap_or_else(|| "master".to_string());
            to_json(commands::shell::manifest::shell_manifest(
                ghost_name,
                shell_name,
                app_handle.clone(),
            ))
        }
        "surface_composition_plan" => {
            let params: commands::shell::manifest::SurfaceCompositionPlanParams =
                parse_arg(&args, "params")?;
            to_json(commands::shell::manifest::surface_composition_plan(
                params,
                app_handle.clone(),
            ))
        }
        "load_surface_image" => {
            let ghost_path: Option<String> =
                parse_opt_arg(&args, "ghostPath").or_else(|| parse_opt_arg(&args, "ghost_path"));
            let shell_name: Option<String> =
                parse_opt_arg(&args, "shellName").or_else(|| parse_opt_arg(&args, "shell_name"));
            let surface_id: Option<String> =
                parse_opt_arg(&args, "surfaceId").or_else(|| parse_opt_arg(&args, "surface_id"));
            to_json(commands::file::load_surface_image(
                ghost_path.clone(),
                ghost_path,
                shell_name.clone(),
                shell_name,
                surface_id.clone(),
                surface_id,
                app_handle.clone(),
            ))
        }
        "load_surface_pna" => {
            let ghost_path: Option<String> =
                parse_opt_arg(&args, "ghostPath").or_else(|| parse_opt_arg(&args, "ghost_path"));
            let shell_name: Option<String> =
                parse_opt_arg(&args, "shellName").or_else(|| parse_opt_arg(&args, "shell_name"));
            let surface_id: Option<String> =
                parse_opt_arg(&args, "surfaceId").or_else(|| parse_opt_arg(&args, "surface_id"));
            to_json(commands::file::load_surface_pna(
                ghost_path.clone(),
                ghost_path,
                shell_name.clone(),
                shell_name,
                surface_id.clone(),
                surface_id,
                app_handle.clone(),
            ))
        }
        "load_cursor_asset" => {
            let base_kind: String =
                parse_arg(&args, "baseKind").or_else(|_| parse_arg(&args, "base_kind"))?;
            let file: String = parse_arg(&args, "file")?;
            let ghost_path: Option<String> =
                parse_opt_arg(&args, "ghostPath").or_else(|| parse_opt_arg(&args, "ghost_path"));
            let shell_name: Option<String> =
                parse_opt_arg(&args, "shellName").or_else(|| parse_opt_arg(&args, "shell_name"));
            let balloon_name: Option<String> = parse_opt_arg(&args, "balloonName")
                .or_else(|| parse_opt_arg(&args, "balloon_name"));
            to_json(commands::file::load_cursor_asset(
                base_kind,
                file,
                ghost_path,
                shell_name,
                balloon_name,
                app_handle.clone(),
            ))
        }
        "open_file" => {
            let path: String = parse_arg(&args, "path")?;
            to_json(commands::file::open_file(path, app_handle.clone()))
        }
        "scan_balloons" => to_json(commands::shell::balloon::scan_balloons(app_handle.clone())),
        "list_balloons" => to_json(commands::shell::balloon::list_balloons(app_handle.clone())),
        "balloon_manifest" => {
            let balloon_name: String = parse_arg(&args, "balloonName")
                .or_else(|_| parse_arg(&args, "balloon_name"))
                .or_else(|_| parse_arg(&args, "name"))?;
            to_json(commands::shell::balloon::balloon_manifest(
                balloon_name,
                parse_opt_arg(&args, "scope_id"),
                parse_opt_arg(&args, "scopeId"),
                parse_opt_arg(&args, "surface_id"),
                parse_opt_arg(&args, "surfaceId"),
                parse_opt_arg(&args, "balloon_id"),
                parse_opt_arg(&args, "balloonId"),
                parse_opt_arg(&args, "is_input_box"),
                parse_opt_arg(&args, "isInputBox"),
                app_handle.clone(),
            ))
        }
        "load_balloon_image" => {
            let balloon_name: String = parse_arg(&args, "balloonName")
                .or_else(|_| parse_arg(&args, "balloon_name"))
                .or_else(|_| parse_arg(&args, "name"))?;
            let file: String = parse_arg(&args, "file")?;
            to_json(commands::shell::balloon::load_balloon_image(
                balloon_name,
                file,
                app_handle.clone(),
            ))
        }
        "load_balloon_ui_asset" => {
            let balloon_name: String = parse_arg(&args, "balloonName")
                .or_else(|_| parse_arg(&args, "balloon_name"))
                .or_else(|_| parse_arg(&args, "name"))?;
            let stem: String =
                parse_arg(&args, "stem").or_else(|_| parse_arg(&args, "filename"))?;
            let scope_id: i32 = parse_opt_arg(&args, "scopeId")
                .or_else(|| parse_opt_arg(&args, "scope_id"))
                .unwrap_or(0);
            to_json(commands::shell::balloon::load_balloon_ui_asset(
                balloon_name,
                stem,
                scope_id,
                app_handle.clone(),
            ))
        }
        "scan_plugins" => to_json(commands::ext::scan_plugins(app_handle.clone()).await),
        "load_ghost" => {
            let ghost_name: String =
                parse_arg(&args, "ghostName").or_else(|_| parse_arg(&args, "ghost_name"))?;
            let ghost_path: Option<String> =
                parse_opt_arg(&args, "ghostPath").or_else(|| parse_opt_arg(&args, "ghost_path"));
            to_json(
                commands::shiori_lifecycle::load::load_ghost(
                    state,
                    ghost_name,
                    ghost_path,
                    app_handle.clone(),
                )
                .await,
            )
        }
        "unload_current_ghost" => to_json(
            commands::shiori_lifecycle::close::unload_current_ghost(state, app_handle.clone())
                .await,
        ),
        "send_shiori_request" => {
            let request: String = parse_arg(&args, "request")?;
            let ghost_id: Option<String> =
                parse_opt_arg(&args, "ghostId").or_else(|| parse_opt_arg(&args, "ghost_id"));
            to_json(commands::shiori_requests::send_shiori_request(state, request, ghost_id).await)
        }
        "send_shiori_event" => {
            let params: commands::shiori_requests::SendShioriEventParams =
                serde_json::from_value(args.get("params").cloned().unwrap_or_else(|| args.clone()))
                    .map_err(|e| format!("invalid send_shiori_event params: {}", e))?;
            to_json(commands::shiori_requests::send_shiori_event(state, params).await)
        }
        "send_shiori_notify" => {
            let params: commands::shiori_requests::SendShioriNotifyParams =
                serde_json::from_value(args.get("params").cloned().unwrap_or_else(|| args.clone()))
                    .map_err(|e| format!("invalid send_shiori_notify params: {}", e))?;
            to_json(commands::shiori_requests::send_shiori_notify(state, params).await)
        }
        "send_on_translate" => {
            let script: String = parse_arg(&args, "script")?;
            let ghost_id: Option<String> =
                parse_opt_arg(&args, "ghostId").or_else(|| parse_opt_arg(&args, "ghost_id"));
            to_json(commands::shiori_events::send_on_translate(state, script, ghost_id).await)
        }
        "on_mouse_click" => to_json(commands::shiori_events::on_mouse_click().await),
        "on_second_change" => to_json(commands::shiori_events::on_second_change().await),
        "get_shiori_status" => to_json(commands::shiori_status::get_shiori_status(state).await),
        "request_overlay_permission" => {
            to_json(commands::android::request_overlay_permission().await)
        }
        "get_overlay_permission_state" => {
            to_json(commands::android::get_overlay_permission_state().await)
        }
        "setup_foreground_service" => {
            let enabled: bool = parse_arg(&args, "enabled")?;
            to_json(commands::android::setup_foreground_service(enabled).await)
        }
        "set_overlay_transparency" => {
            let alpha: f64 = parse_arg(&args, "alpha")?;
            to_json(commands::android::set_overlay_transparency(alpha).await)
        }
        "set_click_through" => {
            let enabled: bool = parse_arg(&args, "enabled")?;
            to_json(commands::android::set_click_through(enabled).await)
        }
        "resize_overlay_window" => {
            let width: u32 = parse_arg(&args, "width")?;
            let height: u32 = parse_arg(&args, "height")?;
            to_json(commands::android::resize_overlay_window(width, height).await)
        }
        "log_from_frontend" => {
            let message: String = parse_arg(&args, "message")?;
            let level: Option<String> = parse_opt_arg(&args, "level");
            to_json(commands::window::log_from_frontend(message, level).await)
        }
        "show_menu_window" => {
            let params = args.get("params").unwrap_or(&args);
            let x: f64 = parse_arg(params, "x")?;
            let y: f64 = parse_arg(params, "y")?;
            let scope: i32 = parse_opt_arg(params, "scope").unwrap_or(0);
            call_service_show_menu(x, y, scope)?;
            Ok(Value::Null)
        }
        "hide_menu_window" => {
            call_service_hide_menu()?;
            Ok(Value::Null)
        }
        "resize_menu_window" => {
            let width: f64 = parse_arg(&args, "width")?;
            let height: f64 = parse_arg(&args, "height")?;
            call_service_resize_menu(width, height)?;
            Ok(Value::Null)
        }
        "show_submenu_window" => {
            let params = args.get("params").unwrap_or(&args);
            let menu_type: String =
                parse_arg(params, "menuType").or_else(|_| parse_arg(params, "menu_type"))?;
            let x: f64 = parse_arg(params, "x")?;
            let y: f64 = parse_arg(params, "y")?;
            let width: f64 = parse_opt_arg(params, "width").unwrap_or(240.0);
            let height: f64 = parse_opt_arg(params, "height").unwrap_or(320.0);
            call_service_show_submenu(&menu_type, x, y, width, height)?;
            Ok(Value::Null)
        }
        "hide_submenu_window" => {
            call_service_hide_submenu()?;
            Ok(Value::Null)
        }
        "resize_submenu_window" => {
            let width: f64 = parse_arg(&args, "width")?;
            let height: f64 = parse_arg(&args, "height")?;
            call_service_resize_submenu(width, height)?;
            Ok(Value::Null)
        }
        "show_loading_banner_window"
        | "hide_loading_banner_window"
        | "set_character_scale"
        | "reset_character_positions"
        | "reset_balloon_positions"
        | "set_balloon_offset"
        | "show_subchar_window"
        | "hide_subchar_window"
        | "minimize_app"
        | "exit_app" => Ok(Value::Null),
        _ => Err(format!("Unsupported overlay command: {cmd}")),
    }
}

#[cfg(target_os = "android")]
fn call_service_static(
    method: &str,
    sig: jni::signature::MethodSignature<'_, '_>,
    args: &[jni::objects::JValue],
) -> Result<(), String> {
    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) };
    vm.attach_current_thread(|env| -> jni::errors::Result<()> {
        let class = env.find_class(jni::strings::JNIString::from(
            "com/nanai_android_mascot/app/NanaiForegroundService",
        ))?;
        env.call_static_method(class, jni::strings::JNIString::from(method), sig, args)?;
        Ok(())
    })
    .map_err(|e| format!("Android service JNI error ({method}): {e:?}"))
}

fn call_service_show_menu(x: f64, y: f64, scope: i32) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        return call_service_static(
            "showMenuFromNative",
            jni::jni_sig!((x: jdouble, y: jdouble, scope: jint) -> void),
            &[
                jni::objects::JValue::Double(x),
                jni::objects::JValue::Double(y),
                jni::objects::JValue::Int(scope),
            ],
        );
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (x, y, scope);
        Ok(())
    }
}

fn call_service_hide_menu() -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        return call_service_static("hideMenuFromNative", jni::jni_sig!(() -> void), &[]);
    }
    #[cfg(not(target_os = "android"))]
    Ok(())
}

fn call_service_resize_menu(width: f64, height: f64) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        return call_service_static(
            "resizeMenuFromNative",
            jni::jni_sig!((width: jdouble, height: jdouble) -> void),
            &[
                jni::objects::JValue::Double(width),
                jni::objects::JValue::Double(height),
            ],
        );
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (width, height);
        Ok(())
    }
}

fn call_service_show_submenu(
    menu_type: &str,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let ctx = ndk_context::android_context();
        let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) };
        return vm
            .attach_current_thread(|env| -> jni::errors::Result<()> {
                let class = env.find_class(jni::strings::JNIString::from(
                    "com/nanai_android_mascot/app/NanaiForegroundService",
                ))?;
                let j_type = env.new_string(menu_type)?;
                env.call_static_method(
                    class,
                    jni::strings::JNIString::from("showSubmenuFromNative"),
                    jni::jni_sig!(
                        (menu_type: java.lang.String, x: jdouble, y: jdouble, width: jdouble, height: jdouble) -> void
                    ),
                    &[
                        jni::objects::JValue::Object(&j_type),
                        jni::objects::JValue::Double(x),
                        jni::objects::JValue::Double(y),
                        jni::objects::JValue::Double(width),
                        jni::objects::JValue::Double(height),
                    ],
                )?;
                Ok(())
            })
            .map_err(|e| format!("Android service JNI error (showSubmenuFromNative): {e:?}"));
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (menu_type, x, y, width, height);
        Ok(())
    }
}

fn call_service_hide_submenu() -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        return call_service_static("hideSubmenuFromNative", jni::jni_sig!(() -> void), &[]);
    }
    #[cfg(not(target_os = "android"))]
    Ok(())
}

fn call_service_resize_submenu(width: f64, height: f64) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        return call_service_static(
            "resizeSubmenuFromNative",
            jni::jni_sig!((width: jdouble, height: jdouble) -> void),
            &[
                jni::objects::JValue::Double(width),
                jni::objects::JValue::Double(height),
            ],
        );
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (width, height);
        Ok(())
    }
}

#[cfg(target_os = "android")]
fn notify_overlay_ipc_result(req_id: &str, ok: bool, payload_json: &str) {
    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) };
    let _ = vm.attach_current_thread(|env| -> jni::errors::Result<()> {
        let class = env.find_class(jni::strings::JNIString::from(
            "com/nanai_android_mascot/app/NanaiForegroundService",
        ))?;
        let j_req_id = env.new_string(req_id)?;
        let j_payload = env.new_string(payload_json)?;
        env.call_static_method(
            class,
            jni::strings::JNIString::from("resolveOverlayIpc"),
            jni::jni_sig!((req_id: java.lang.String, ok: jboolean, payload: java.lang.String) -> void),
            &[
                jni::objects::JValue::Object(&j_req_id),
                jni::objects::JValue::Bool(ok),
                jni::objects::JValue::Object(&j_payload),
            ],
        )?;
        Ok(())
    });
}

#[cfg(target_os = "android")]
#[unsafe(no_mangle)]
pub extern "system" fn Java_com_nanai_1android_1mascot_app_NanaiForegroundService_nativeOverlayInvoke<
    'local,
>(
    mut unowned_env: jni::EnvUnowned<'local>,
    _class: jni::objects::JClass<'local>,
    req_id: jni::objects::JString<'local>,
    cmd: jni::objects::JString<'local>,
    args_json: jni::objects::JString<'local>,
) {
    let (req_id_str, cmd_str, args_str) = match unowned_env
        .with_env(|_env| -> jni::errors::Result<(String, String, String)> {
            Ok((req_id.to_string(), cmd.to_string(), args_json.to_string()))
        })
        .into_outcome()
    {
        jni::Outcome::Ok(v) => v,
        _ => return,
    };

    let Some(app_handle) = get_overlay_app_handle() else {
        notify_overlay_ipc_result(
            &req_id_str,
            false,
            &serde_json::json!("AppHandle is not initialized yet").to_string(),
        );
        return;
    };

    let args_val: Value =
        serde_json::from_str(&args_str).unwrap_or_else(|_| Value::Object(Default::default()));
    tauri::async_runtime::spawn(async move {
        match dispatch_overlay_command(app_handle, &cmd_str, args_val).await {
            Ok(val) => {
                let json = serde_json::to_string(&val).unwrap_or_else(|_| "null".to_string());
                notify_overlay_ipc_result(&req_id_str, true, &json);
            }
            Err(err) => {
                let json = serde_json::to_string(&err).unwrap_or_else(|_| "\"error\"".to_string());
                notify_overlay_ipc_result(&req_id_str, false, &json);
            }
        }
    });
}

#[cfg(target_os = "android")]
#[unsafe(no_mangle)]
pub extern "system" fn Java_com_nanai_1android_1mascot_app_NanaiForegroundService_nativeOverlayLoadAsset<
    'local,
>(
    mut unowned_env: jni::EnvUnowned<'local>,
    _class: jni::objects::JClass<'local>,
    path: jni::objects::JString<'local>,
) -> jni::objects::JByteArray<'local> {
    let outcome = unowned_env
        .with_env(
            |env| -> jni::errors::Result<jni::objects::JByteArray<'local>> {
                let path_str = path.to_string();
                let normalized = path_str.trim_start_matches('/').to_string();
                let target = if normalized.is_empty() {
                    "index.html".to_string()
                } else {
                    normalized
                };
                let Some(app_handle) = get_overlay_app_handle() else {
                    return Ok(jni::objects::JByteArray::default());
                };
                let Some(asset) = app_handle.asset_resolver().get(target) else {
                    return Ok(jni::objects::JByteArray::default());
                };
                env.byte_array_from_slice(&asset.bytes)
            },
        )
        .into_outcome();

    match outcome {
        jni::Outcome::Ok(arr) => arr,
        _ => jni::objects::JByteArray::default(),
    }
}
