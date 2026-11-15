use nanai_android_mascot_ui::{
    SakuraCommand, SurfaceManifest, Timeline, parse_sakura_script as ui_parse_sakura_script,
};
use nanai_surface::{AnimationPattern, DrawMethod, parse_surfaces_txt};
use std::collections::BTreeMap;

#[tauri::command]
pub fn parse_sakura_script(script: String) -> Result<Vec<SakuraCommand>, String> {
    Ok(ui_parse_sakura_script(&script))
}

#[tauri::command]
pub fn parse_surfaces_text(content: String) -> Result<BTreeMap<u32, SurfaceManifest>, String> {
    let surfaces_txt = parse_surfaces_txt(&content);
    let mut map = BTreeMap::new();
    for (id, def) in surfaces_txt.surfaces().iter() {
        map.insert(
            *id,
            SurfaceManifest::new(*id, def.name().map(str::to_string), def.clone()),
        );
    }
    Ok(map)
}

#[derive(serde::Deserialize)]
pub struct TimelinePattern {
    #[allow(dead_code)]
    index: u32,
    wait_ms: u32,
}

#[derive(serde::Serialize)]
pub struct TimelineFrame {
    at_ms: u32,
}

#[derive(serde::Serialize)]
pub struct AnimationTimeline {
    frames: Vec<TimelineFrame>,
    total_ms: u32,
}

#[tauri::command]
pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTimeline, String> {
    let anims: Vec<AnimationPattern> = patterns
        .iter()
        .map(|p| {
            AnimationPattern::new(
                p.index,
                DrawMethod::Overlay,
                0,
                p.wait_ms,
                None,
                0,
                0,
                vec![],
            )
        })
        .collect();
    let timeline = Timeline::new(&anims);
    Ok(AnimationTimeline {
        frames: timeline
            .frames()
            .iter()
            .map(|f| TimelineFrame { at_ms: f.at_ms() })
            .collect(),
        total_ms: timeline.total_ms(),
    })
}
