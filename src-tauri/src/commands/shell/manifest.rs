use crate::common::paths::{open_text_file, resolve_ghost_directory, resolve_vfs_path};
use crate::ui_adapter::shell::{Shell, ShellManifest};
use nanai_surface::{CompositionLayer, CompositionPlan, DrawMethod};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;

fn resolve_shell_dir(
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
    let _alias_table = crate::ghost::scan::shell::alias::read_shell_alias_txt(&shell_dir);
    let seriko = crate::ghost::scan::read_descript_file(&shell_dir.join("descript.txt"))
        .map(|props| crate::ghost::scan::shell::seriko::extract_shell_seriko_config(&props));
    let mut manifest = shell.manifest();
    manifest.set_seriko(seriko);
    Ok(manifest)
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

/// shell/<name>/readme.txt を読み込む（存在しなければ None）。
fn read_shell_readme(shell_dir: &std::path::Path) -> Option<String> {
    for f in ["readme.txt", "Readme.txt", "README.TXT"] {
        let p = shell_dir.join(f);
        if p.is_file() {
            return open_text_file(&p).ok();
        }
    }
    None
}

/// shell/<name>/thumbnail.png を探索してパスを返す。
fn find_shell_thumbnail(shell_dir: &std::path::Path) -> Option<PathBuf> {
    for f in ["thumbnail.png", "Thumbnail.png", "THUMBNAIL.PNG"] {
        let p = shell_dir.join(f);
        if p.is_file() {
            return Some(p);
        }
    }
    None
}

#[tauri::command]
pub fn get_shell_readme(
    ghost_name: String,
    shell_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_shell_dir(&ghost_name, &shell_name, &app_handle)?;
    Ok(read_shell_readme(&dir))
}

/// thumbnail.png を data URL で返す。
#[tauri::command]
pub fn get_shell_thumbnail(
    ghost_name: String,
    shell_name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    use base64::Engine;
    let dir = resolve_shell_dir(&ghost_name, &shell_name, &app_handle)?;
    match find_shell_thumbnail(&dir) {
        Some(p) => {
            let bytes = std::fs::read(&p).map_err(|e| e.to_string())?;
            Ok(Some(format!(
                "data:image/png;base64,{}",
                base64::engine::general_purpose::STANDARD.encode(bytes)
            )))
        }
        None => Ok(None),
    }
}

#[cfg(test)]
mod shell_extra_tests {
    use super::*;

    #[test]
    fn readme_and_thumbnail_loaded_from_files() {
        let d = std::env::temp_dir().join(format!("nanai_shell_t_{}", std::process::id()));
        std::fs::create_dir_all(&d).unwrap();
        assert!(read_shell_readme(&d).is_none());
        assert!(find_shell_thumbnail(&d).is_none());
        std::fs::write(d.join("readme.txt"), "hello").unwrap();
        std::fs::write(d.join("thumbnail.png"), [0u8]).unwrap();
        assert_eq!(read_shell_readme(&d).as_deref(), Some("hello"));
        assert!(find_shell_thumbnail(&d).is_some());
        let _ = std::fs::remove_dir_all(&d);
    }
}
