use super::{resolve_ghost_directory, resolve_vfs_path};
use nanai_android_mascot_ui::manifest::ShellManifest;
use nanai_android_mascot_ui::shell::Shell;
use nanai_surface::{CompositionLayer, CompositionPlan, DrawMethod};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;

pub fn resolve_shell_dir(
    ghost_name: &str,
    shell_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    if let Ok(ghost_dir) = resolve_ghost_directory(ghost_name, app_handle) {
        let dir = ghost_dir.join("shell").join(shell_name);
        if dir.is_dir() {
            return Ok(dir);
        }
        if let Some(resolved_shell) = resolve_vfs_path(&ghost_dir.join("shell"), shell_name)
            && resolved_shell.is_dir()
        {
            return Ok(resolved_shell);
        }
    }
    Err(format!(
        "shell directory not found: ghost={}, shell={}",
        ghost_name, shell_name
    ))
}

#[tauri::command]
pub fn shell_manifest(
    ghost_name: String,
    shell_name: String,
    app_handle: tauri::AppHandle,
) -> Result<ShellManifest, String> {
    let shell_dir = resolve_shell_dir(&ghost_name, &shell_name, &app_handle)?;
    let shell = Shell::load(&shell_dir).map_err(|e| e.to_string())?;
    Ok(shell.manifest())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompositionPlanSnapshot {
    surface: u32,
    layers: Vec<PlanLayer>,
    plan_hash: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanLayer {
    kind: &'static str,
    file: String,
    surface: i32,
    x: i32,
    y: i32,
    method: String,
}

impl CompositionPlanSnapshot {
    fn snapshot(plan: CompositionPlan) -> Self {
        let layers = plan
            .layers()
            .iter()
            .map(|layer| match layer {
                CompositionLayer::Element(e) => PlanLayer {
                    kind: "element",
                    file: e.file().to_string(),
                    surface: 0,
                    x: e.x(),
                    y: e.y(),
                    method: method_string(e.method()),
                },
                CompositionLayer::Pattern(p) => PlanLayer {
                    kind: "pattern",
                    file: String::new(),
                    surface: p.surface(),
                    x: p.x(),
                    y: p.y(),
                    method: method_string(p.method()),
                },
            })
            .collect();
        let mut hasher = DefaultHasher::new();
        plan.surface().hash(&mut hasher);
        for layer in plan.layers() {
            match layer {
                CompositionLayer::Element(e) => {
                    "element".hash(&mut hasher);
                    e.file().hash(&mut hasher);
                    e.x().hash(&mut hasher);
                    e.y().hash(&mut hasher);
                    method_string(e.method()).hash(&mut hasher);
                }
                CompositionLayer::Pattern(p) => {
                    "pattern".hash(&mut hasher);
                    p.surface().hash(&mut hasher);
                    p.x().hash(&mut hasher);
                    p.y().hash(&mut hasher);
                    method_string(p.method()).hash(&mut hasher);
                }
            }
        }
        Self {
            surface: plan.surface(),
            layers,
            plan_hash: format!("{:016x}", hasher.finish()),
        }
    }
}

fn method_string(method: &DrawMethod) -> String {
    match method {
        DrawMethod::Base => "base".to_string(),
        DrawMethod::Overlay => "overlay".to_string(),
        DrawMethod::OverlayFast => "overlayfast".to_string(),
        DrawMethod::Interpolate => "interpolate".to_string(),
        DrawMethod::Replace => "replace".to_string(),
        DrawMethod::Add | DrawMethod::Bind => "add".to_string(),
        DrawMethod::AsIs => "asis".to_string(),
        DrawMethod::Auto => "auto".to_string(),
        DrawMethod::Move => "move".to_string(),
        DrawMethod::Insert => "insert".to_string(),
        DrawMethod::Blend(name) => format!("blend-{name}"),
        DrawMethod::Custom(name) => name.clone(),
        _ => "".to_string(),
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SurfaceCompositionPlanParams {
    ghost_name: String,
    shell_name: String,
    surface_id: u32,
    binds: Option<Vec<u32>>,
}

impl SurfaceCompositionPlanParams {
    // Add getter methods
    pub fn ghost_name(&self) -> &str {
        &self.ghost_name
    }

    pub fn shell_name(&self) -> &str {
        &self.shell_name
    }

    pub fn surface_id(&self) -> u32 {
        self.surface_id
    }

    pub fn binds(&self) -> Option<&[u32]> {
        self.binds.as_deref()
    }
}

#[tauri::command]
pub fn surface_composition_plan(
    params: SurfaceCompositionPlanParams,
    app_handle: tauri::AppHandle,
) -> Result<Option<CompositionPlanSnapshot>, String> {
    let shell_dir = resolve_shell_dir(params.ghost_name(), params.shell_name(), &app_handle)?;
    let shell = Shell::load(&shell_dir).map_err(|e| e.to_string())?;
    let plan = shell.composition_plan(params.surface_id(), params.binds().unwrap_or(&[]));
    Ok(plan.map(CompositionPlanSnapshot::snapshot))
}
