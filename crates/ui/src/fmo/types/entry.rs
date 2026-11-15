//! FMO 共有メモリ同期エントリモデル (`FmoEntry`)

use super::record::FmoRecord;
use serde::{Deserialize, Serialize};

/// Slot-01 Contract: FmoEntry 構造体 (FMO共有メモリ同期エントリ)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FmoEntry {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) keroname: String,
    pub(crate) hwnd: u64,
    pub(crate) sakura_surface: i32,
    pub(crate) kero_surface: i32,
    pub(crate) ghostpath: String,
    pub(crate) balloon0: String,
    pub(crate) balloon1: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) kerohwnd: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) modulestate: Option<String>,
    /// モバイル/ライフサイクル状態: 表示中 (true) / 最小化・バックグラウンド非表示 (false)
    #[serde(default = "default_visible")]
    pub(crate) is_visible: bool,
    /// ライフサイクルステートタグ ("active", "paused", "stopped")
    #[serde(default = "default_lifecycle_state")]
    pub(crate) lifecycle_state: String,
}

#[allow(dead_code)]
impl FmoEntry {
    pub fn id(&self) -> &str {
        &self.id
    }
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn keroname(&self) -> &str {
        &self.keroname
    }
    pub fn hwnd(&self) -> u64 {
        self.hwnd
    }
    pub fn sakura_surface(&self) -> i32 {
        self.sakura_surface
    }
    pub fn kero_surface(&self) -> i32 {
        self.kero_surface
    }
    pub fn ghostpath(&self) -> &str {
        &self.ghostpath
    }
    pub fn balloon0(&self) -> &str {
        &self.balloon0
    }
    pub fn balloon1(&self) -> &str {
        &self.balloon1
    }
    pub fn kerohwnd(&self) -> Option<u64> {
        self.kerohwnd
    }
    pub fn modulestate(&self) -> Option<&str> {
        self.modulestate.as_deref()
    }
    pub fn is_visible(&self) -> bool {
        self.is_visible
    }
    pub fn lifecycle_state(&self) -> &str {
        &self.lifecycle_state
    }

    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            keroname: String::new(),
            hwnd: 0,
            sakura_surface: 0,
            kero_surface: 10,
            ghostpath: String::new(),
            balloon0: String::new(),
            balloon1: String::new(),
            kerohwnd: None,
            modulestate: None,
            is_visible: true,
            lifecycle_state: "active".to_string(),
        }
    }

    pub fn with_keroname(mut self, keroname: impl Into<String>) -> Self {
        self.keroname = keroname.into();
        self
    }

    pub fn with_surfaces(mut self, sakura: i32, kero: i32) -> Self {
        self.sakura_surface = sakura;
        self.kero_surface = kero;
        self
    }

    pub fn with_balloons(
        mut self,
        balloon0: impl Into<String>,
        balloon1: impl Into<String>,
    ) -> Self {
        self.balloon0 = balloon0.into();
        self.balloon1 = balloon1.into();
        self
    }

    pub fn with_hwnd(mut self, hwnd: u64, kerohwnd: Option<u64>) -> Self {
        self.hwnd = hwnd;
        self.kerohwnd = kerohwnd;
        self
    }

    pub fn with_ghostpath(mut self, ghostpath: impl Into<String>) -> Self {
        self.ghostpath = ghostpath.into();
        self
    }

    pub fn with_modulestate(mut self, modulestate: impl Into<String>) -> Self {
        self.modulestate = Some(modulestate.into());
        self
    }

    /// モジュールステートをライフサイクル状態と統合して更新
    pub fn update_lifecycle(&mut self, state: &str, is_visible: bool) {
        self.lifecycle_state = state.to_string();
        self.is_visible = is_visible;

        let base_state = self.modulestate.as_deref().unwrap_or("shiori:running");

        let mut parts: Vec<&str> = base_state
            .split(',')
            .filter(|p| !p.starts_with("lifecycle:"))
            .collect();

        let lifecycle_tag = format!("lifecycle:{}", state);
        if !parts.contains(&lifecycle_tag.as_str()) {
            parts.push(&lifecycle_tag);
        }
        self.modulestate = Some(parts.join(","));
    }

    /// FmoRecord へ変換する
    pub fn to_record(&self) -> FmoRecord {
        FmoRecord::new(self.id.clone(), self.name.clone())
            .with_keroname(self.keroname.clone())
            .with_surfaces(self.sakura_surface, self.kero_surface)
            .with_paths("", self.ghostpath.clone())
            .with_hwnd(self.hwnd, self.kerohwnd)
            .with_fullname(Some(self.name.clone()))
            .with_modulestate_opt(self.modulestate.clone())
    }

    /// FmoRecord から FmoEntry を生成する
    pub fn from_record(rec: &FmoRecord) -> Self {
        let (lifecycle_state, is_visible) = if let Some(ms) = rec.modulestate() {
            let mut state = "active".to_string();
            let mut visible = true;
            for part in ms.split(',') {
                if let Some(s) = part.strip_prefix("lifecycle:") {
                    state = s.to_string();
                    if s == "paused" || s == "stopped" || s == "invisible" {
                        visible = false;
                    }
                }
            }
            (state, visible)
        } else {
            ("active".to_string(), true)
        };

        Self {
            id: rec.id().to_string(),
            name: rec.name().to_string(),
            keroname: rec.keroname().to_string(),
            hwnd: rec.hwnd(),
            sakura_surface: rec.sakura_surface(),
            kero_surface: rec.kero_surface(),
            ghostpath: rec.ghostpath().to_string(),
            balloon0: String::new(),
            balloon1: String::new(),
            kerohwnd: rec.kerohwnd(),
            modulestate: rec.modulestate().map(ToString::to_string),
            is_visible,
            lifecycle_state,
        }
    }
}

fn default_visible() -> bool {
    true
}

fn default_lifecycle_state() -> String {
    "active".to_string()
}
