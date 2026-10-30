use nanai_android_mascot_ui::{SakuraCommand, SurfaceManifest};
use std::collections::BTreeMap;

#[tauri::command]
pub fn parse_sakura_script(script: String) -> Result<Vec<SakuraCommand>, String> {
    Ok(nanai_android_mascot_ui::parse_sakura_script(&script))
}

#[tauri::command]
pub fn parse_surfaces_text(content: String) -> Result<BTreeMap<u32, SurfaceManifest>, String> {
    let surfaces_txt = nanai_android_mascot_ui::parse_surfaces_txt(&content);
    let mut map = BTreeMap::new();
    for (id, def) in surfaces_txt.surfaces.iter() {
        map.insert(
            *id,
            SurfaceManifest {
                number: *id,
                name: def.name.clone(),
                definition: def.clone(),
            },
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
    use nanai_android_mascot_ui::Timeline;
    use nanai_android_mascot_ui::surfaces::{AnimationPattern, DrawMethod};

    let anims: Vec<AnimationPattern> = patterns
        .iter()
        .map(|p| AnimationPattern {
            index: p.index,
            method: DrawMethod::Overlay,
            surface: 0,
            wait: p.wait_ms,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        })
        .collect();
    let timeline = Timeline::new(&anims);
    Ok(AnimationTimeline {
        frames: timeline
            .frames()
            .iter()
            .map(|f| TimelineFrame { at_ms: f.at_ms })
            .collect(),
        total_ms: timeline.total_ms(),
    })
}
