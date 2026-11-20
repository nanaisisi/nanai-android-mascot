#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowBalloonWindowParams {
    #[serde(alias = "scopeId")]
    pub scope_id: Option<i32>,
    pub theme: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
}

#[cfg(any(desktop, test))]
#[allow(clippy::too_many_arguments)]
pub fn resolve_show_balloon_args(
    params: Option<ShowBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> (
    i32,
    Option<String>,
    Option<f64>,
    Option<f64>,
    Option<f64>,
    Option<f64>,
) {
    let resolved_params = params.unwrap_or_default();
    let s_id = resolved_params
        .scope_id
        .or(scope_id)
        .or(scope_id_camel)
        .unwrap_or(0);
    let t_val = resolved_params.theme.or(theme);
    let p_x = resolved_params.x.or(x);
    let p_y = resolved_params.y.or(y);
    let w_val = resolved_params.width.or(width);
    let h_val = resolved_params.height.or(height);
    (s_id, t_val, p_x, p_y, w_val, h_val)
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ResizeBalloonWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ResizeBalloonWindowParams {
    #[allow(dead_code)]
    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }

    #[allow(dead_code)]
    pub fn width(&self) -> f64 {
        self.width.unwrap_or(280.0)
    }

    #[allow(dead_code)]
    pub fn height(&self) -> f64 {
        self.height.unwrap_or(200.0)
    }
}

#[cfg(any(desktop, test))]
pub fn resolve_resize_balloon_args(
    params: Option<ResizeBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
) -> (i32, f64, f64) {
    let resolved_params = params.unwrap_or_default();
    let target_scope = resolved_params
        .scope_id
        .or(scope_id)
        .or(scope_id_camel)
        .unwrap_or(0);
    let target_width = resolved_params.width.or(width).unwrap_or(0.0);
    let target_height = resolved_params.height.or(height).unwrap_or(0.0);
    (target_scope, target_width, target_height)
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct HideBalloonWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
}

impl HideBalloonWindowParams {
    #[allow(dead_code)]
    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }
}

#[cfg(any(desktop, test))]
pub fn resolve_hide_balloon_scope(
    params: Option<HideBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    scope_id_legacy: Option<i32>,
) -> i32 {
    params
        .and_then(|p| p.scope_id)
        .or(scope_id)
        .or(scope_id_camel)
        .or(scope_id_legacy)
        .unwrap_or(0)
}
