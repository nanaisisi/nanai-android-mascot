use super::super::descript::read_descript_file;
use std::path::Path;

pub struct GhostManifest {
    pub display_name: String,
    pub version: Option<String>,
    pub sakura_name: Option<String>,
    pub kero_name: Option<String>,
    pub shiori: Option<String>,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub group: Option<String>,
    pub recommended_balloon: Option<String>,
    pub recommended_balloon_path: Option<String>,
    pub default_balloon_path: Option<String>,
    pub sstp_allow_communicate: bool,
    pub sstp_allow_unspecified_send: bool,
    pub sstp_always_translate: bool,
}

pub fn parse_ghost_manifest(path: &Path, dir_name: &str) -> GhostManifest {
    let descript_candidates = [
        path.join("ghost").join("master").join("descript.txt"),
        path.join("descript.txt"),
        path.join("install.txt"),
    ];
    let mut meta_map = None;
    for cand in &descript_candidates {
        if let Some(map) = read_descript_file(cand) {
            meta_map = Some(map);
            break;
        }
    }

    let display_name = meta_map
        .as_ref()
        .and_then(|m| m.get("name").cloned().or_else(|| m.get("title").cloned()))
        .unwrap_or_else(|| dir_name.to_string());

    let version = meta_map.as_ref().and_then(|m| m.get("version").cloned());
    let sakura_name = meta_map.as_ref().and_then(|m| {
        m.get("sakura.name")
            .cloned()
            .or_else(|| m.get("sakura.name2").cloned())
    });
    let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());

    let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
    let craftman = meta_map.as_ref().and_then(|m| {
        m.get("craftman")
            .cloned()
            .or_else(|| m.get("craftmanw").cloned())
    });
    let craftman_url = meta_map.as_ref().and_then(|m| {
        m.get("craftmanurl")
            .cloned()
            .or_else(|| m.get("homeurl").cloned())
    });

    let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());

    let recommended_balloon = meta_map.as_ref().and_then(|m| {
        m.get("recommended.balloon")
            .cloned()
            .or_else(|| m.get("balloon").cloned())
    });

    let recommended_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("recommended.balloon.path").cloned());

    let default_balloon_path = meta_map
        .as_ref()
        .and_then(|m| m.get("default.balloon.path").cloned());

    let sstp_allow_communicate = meta_map
        .as_ref()
        .and_then(|m| m.get("sstp.allowcommunicate"))
        .map(|v| v.trim() != "0")
        .unwrap_or(true);

    let sstp_allow_unspecified_send = meta_map
        .as_ref()
        .and_then(|m| m.get("sstp.allowunspecifiedsend"))
        .map(|v| v.trim() != "0")
        .unwrap_or(true);

    let sstp_always_translate = meta_map
        .as_ref()
        .and_then(|m| m.get("sstp.alwaystranslate"))
        .map(|v| v.trim() == "1")
        .unwrap_or(false);

    GhostManifest {
        display_name,
        version,
        sakura_name,
        kero_name,
        shiori,
        craftman,
        craftman_url,
        group,
        recommended_balloon,
        recommended_balloon_path,
        default_balloon_path,
        sstp_allow_communicate,
        sstp_allow_unspecified_send,
        sstp_always_translate,
    }
}
