use super::super::descript::read_descript_file;
use std::path::Path;

#[allow(dead_code)]
pub struct GhostManifest {
    pub display_name: String,
    pub version: Option<String>,
    pub sakura_name: Option<String>,
    pub kero_name: Option<String>,
    pub num_characters: i32,
    pub shiori: Option<String>,
    pub craftman: Option<String>,
    pub craftman_url: Option<String>,
    pub group: Option<String>,
    pub recommended_balloon: Option<String>,
    pub recommended_balloon_path: Option<String>,
    pub default_balloon_path: Option<String>,
    pub balloon_defaultsurface: Option<i32>,
    pub sakura_balloon_defaultsurface: Option<i32>,
    pub kero_balloon_defaultsurface: Option<i32>,
    pub char_balloon_defaultsurfaces: std::collections::BTreeMap<i32, i32>,
    pub shiori_version: Option<String>,
    pub shiori_cache: Option<String>,
    pub shiori_encoding: Option<String>,
    pub shiori_forceencoding: Option<String>,
    pub shiori_escape_unknown: Option<String>,
    pub shiori_logo_file: Option<String>,
    pub shiori_logo_align: Option<String>,
    pub shiori_logo_x: Option<i32>,
    pub shiori_logo_y: Option<i32>,
    pub sstp_allow_communicate: bool,
    pub sstp_allow_unspecified_send: bool,
    pub sstp_always_translate: bool,
    pub install_accept: Option<String>,
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

    let has_kero = meta_map
        .as_ref()
        .is_some_and(|m| m.contains_key("kero.name") || m.contains_key("char1.name"));
    let mut max_char_id = if has_kero { 1 } else { 0 };
    if let Some(ref m) = meta_map {
        for k in m.keys() {
            if let Some(rest) = k.strip_prefix("char")
                && let Some(idx_str) = rest.split('.').next()
                && let Ok(id) = idx_str.parse::<i32>()
                && id > max_char_id
            {
                max_char_id = id;
            }
        }
    }
    let num_characters = max_char_id + 1;

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

    // [balloon.defaultsurface,数値]: 全身・ベース規定バルーンサーフィス
    let balloon_defaultsurface = meta_map.as_ref().and_then(|m| {
        m.get("balloon.defaultsurface")
            .and_then(|v| v.trim().parse::<i32>().ok())
    });

    // [sakura.balloon.defaultsurface,数値]: sakura側規定バルーンサーフィス
    let sakura_balloon_defaultsurface = meta_map.as_ref().and_then(|m| {
        m.get("sakura.balloon.defaultsurface")
            .and_then(|v| v.trim().parse::<i32>().ok())
    });

    // [kero.balloon.defaultsurface,数値]: kero側規定バルーンサーフィス
    let kero_balloon_defaultsurface = meta_map.as_ref().and_then(|m| {
        m.get("kero.balloon.defaultsurface")
            .and_then(|v| v.trim().parse::<i32>().ok())
    });

    // [char*.balloon.defaultsurface,数値]: 任意キャラID規定バルーンサーフィス (例: char0.balloon.defaultsurface, char1.balloon.defaultsurface, char2.balloon.defaultsurface)
    let mut char_balloon_defaultsurfaces = std::collections::BTreeMap::new();
    if let Some(ref m) = meta_map {
        for (k, v) in m.iter() {
            if let Some(rest) = k.strip_prefix("char")
                && let Some(num_str) = rest.strip_suffix(".balloon.defaultsurface")
                && let Ok(char_id) = num_str.trim().parse::<i32>()
                && let Ok(surface_id) = v.trim().parse::<i32>()
            {
                char_balloon_defaultsurfaces.insert(char_id, surface_id);
            }
        }
    }

    let shiori_version = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.version").cloned());
    let shiori_cache = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.cache").cloned());
    let shiori_encoding = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.encoding").cloned());
    let shiori_forceencoding = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.forceencoding").cloned());
    let shiori_escape_unknown = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.escape_unknown").cloned());
    let shiori_logo_file = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.logo.file").cloned());
    let shiori_logo_align = meta_map
        .as_ref()
        .and_then(|m| m.get("shiori.logo.align").cloned());
    let shiori_logo_x = meta_map.as_ref().and_then(|m| {
        m.get("shiori.logo.x")
            .and_then(|v| v.trim().parse::<i32>().ok())
    });
    let shiori_logo_y = meta_map.as_ref().and_then(|m| {
        m.get("shiori.logo.y")
            .and_then(|v| v.trim().parse::<i32>().ok())
    });
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

    let install_accept = meta_map.as_ref().and_then(|m| {
        m.get("install.accept")
            .cloned()
            .or_else(|| m.get("accept").cloned())
    });

    GhostManifest {
        display_name,
        version,
        sakura_name,
        kero_name,
        num_characters,
        shiori,
        craftman,
        craftman_url,
        group,
        recommended_balloon,
        recommended_balloon_path,
        default_balloon_path,
        balloon_defaultsurface,
        sakura_balloon_defaultsurface,
        kero_balloon_defaultsurface,
        char_balloon_defaultsurfaces,
        shiori_version,
        shiori_cache,
        shiori_encoding,
        shiori_forceencoding,
        shiori_escape_unknown,
        shiori_logo_file,
        shiori_logo_align,
        shiori_logo_x,
        shiori_logo_y,
        sstp_allow_communicate,
        sstp_allow_unspecified_send,
        sstp_always_translate,
        install_accept,
    }
}
