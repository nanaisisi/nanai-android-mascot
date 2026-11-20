//! シェル `descript.txt` の `seriko.*` 設定抽出

use std::collections::HashMap;

/// シェル `descript.txt` から抽出される SERIKO 関連設定
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ShellSerikoConfig {
    /// 推奨 DPI (`seriko.dpi`)
    pub dpi: Option<u32>,
    /// クロスフェード強制無効化 (`seriko.force_disable_crossfade`)
    pub force_disable_crossfade: bool,
    /// スコープ Z オーダー (`seriko.zorder`)
    pub zorder: Vec<u32>,
    /// 連動移動スコープ群 (`seriko.sticky-window`)
    pub sticky_window: Vec<u32>,
    /// Sakura 側デスクトップ位置揃え (`sakura.seriko.alignmenttodesktop` / `seriko.alignmenttodesktop`)
    pub sakura_alignment_to_desktop: Option<String>,
    /// Kero 側デスクトップ位置揃え (`kero.seriko.alignmenttodesktop` / `seriko.alignmenttodesktop`)
    pub kero_alignment_to_desktop: Option<String>,
}

/// カンマ区切りのスコープ ID 列をパースする（重複排除・順序維持）
pub fn parse_scope_id_list(raw: &str) -> Vec<u32> {
    let mut ids = Vec::new();
    for part in raw.split(',') {
        let trimmed = part.trim();
        if trimmed.is_empty() {
            continue;
        }
        if let Ok(id) = trimmed.parse::<u32>()
            && !ids.contains(&id)
        {
            ids.push(id);
        }
    }
    ids
}

/// `descript.txt` のプロパティマップから `ShellSerikoConfig` を抽出する
pub fn extract_shell_seriko_config(props: &HashMap<String, String>) -> ShellSerikoConfig {
    let dpi = props
        .get("seriko.dpi")
        .and_then(|v| v.trim().parse::<u32>().ok())
        .filter(|&v| v > 0);

    let force_disable_crossfade = props
        .get("seriko.force_disable_crossfade")
        .map(|v| {
            let trimmed = v.trim();
            trimmed == "1" || trimmed.eq_ignore_ascii_case("true")
        })
        .unwrap_or(false);

    let zorder = props
        .get("seriko.zorder")
        .map(|v| parse_scope_id_list(v))
        .unwrap_or_default();

    let sticky_window = props
        .get("seriko.sticky-window")
        .map(|v| parse_scope_id_list(v))
        .unwrap_or_default();

    let base_alignment = props
        .get("seriko.alignmenttodesktop")
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty());

    let sakura_alignment_to_desktop = props
        .get("sakura.seriko.alignmenttodesktop")
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .or_else(|| base_alignment.clone());

    let kero_alignment_to_desktop = props
        .get("kero.seriko.alignmenttodesktop")
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .or(base_alignment);

    ShellSerikoConfig {
        dpi,
        force_disable_crossfade,
        zorder,
        sticky_window,
        sakura_alignment_to_desktop,
        kero_alignment_to_desktop,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_all_seriko_keys() {
        let mut props = HashMap::new();
        props.insert("seriko.dpi".to_string(), "144".to_string());
        props.insert(
            "seriko.force_disable_crossfade".to_string(),
            "1".to_string(),
        );
        props.insert("seriko.zorder".to_string(), "1, 0, 2, 1".to_string());
        props.insert("seriko.sticky-window".to_string(), "0,1".to_string());
        props.insert(
            "kero.seriko.alignmenttodesktop".to_string(),
            "free".to_string(),
        );
        props.insert(
            "seriko.alignmenttodesktop".to_string(),
            "bottom".to_string(),
        );

        let cfg = extract_shell_seriko_config(&props);
        assert_eq!(cfg.dpi, Some(144));
        assert!(cfg.force_disable_crossfade);
        assert_eq!(cfg.zorder, vec![1, 0, 2]);
        assert_eq!(cfg.sticky_window, vec![0, 1]);
        assert_eq!(cfg.sakura_alignment_to_desktop.as_deref(), Some("bottom"));
        assert_eq!(cfg.kero_alignment_to_desktop.as_deref(), Some("free"));
    }

    #[test]
    fn handles_invalid_and_empty_values() {
        let mut props = HashMap::new();
        props.insert("seriko.dpi".to_string(), "0".to_string());
        props.insert(
            "seriko.force_disable_crossfade".to_string(),
            "0".to_string(),
        );
        props.insert("seriko.zorder".to_string(), "abc, -1, 3".to_string());

        let cfg = extract_shell_seriko_config(&props);
        assert_eq!(cfg.dpi, None);
        assert!(!cfg.force_disable_crossfade);
        assert_eq!(cfg.zorder, vec![3]);
        assert!(cfg.sticky_window.is_empty());
        assert_eq!(cfg.sakura_alignment_to_desktop, None);
        assert_eq!(cfg.kero_alignment_to_desktop, None);
    }
}
