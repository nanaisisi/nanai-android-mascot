use serde::{Deserialize, Serialize};

/// ベースウェアおよび FMO で使用される標準 Mutex 名
pub const MUTEX_SSP: &str = "ssp";
pub const MUTEX_SAKURA: &str = "sakura";
pub const MUTEX_SAKURA_FMO: &str = "SakuraFMO";
pub const MUTEX_SAKURA_UNICODE_FMO: &str = "SakuraUnicodeFMO";

/// FMO レコード
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FmoRecord {
    pub id: String,
    pub path: String,
    pub hwnd: u64,
    pub name: String,
    pub keroname: String,
    pub sakura_surface: i32,
    pub kero_surface: i32,
    pub ghostpath: String,
    pub kerohwnd: Option<u64>,
    pub hwndlist: Vec<u64>,
    pub fullname: Option<String>,
    pub modulestate: Option<String>,
}

impl FmoRecord {
    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            path: String::new(),
            hwnd: 0,
            name: name.into(),
            keroname: String::new(),
            sakura_surface: 0,
            kero_surface: 10,
            ghostpath: String::new(),
            kerohwnd: None,
            hwndlist: Vec::new(),
            fullname: None,
            modulestate: None,
        }
    }
}

/// Slot-01 Contract: FmoEntry 構造体 (FMO共有メモリ同期エントリ)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FmoEntry {
    pub id: String,
    pub name: String,
    pub keroname: String,
    pub hwnd: u64,
    pub sakura_surface: i32,
    pub kero_surface: i32,
    pub ghostpath: String,
    pub balloon0: String,
    pub balloon1: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kerohwnd: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modulestate: Option<String>,
    /// モバイル/ライフサイクル状態: 表示中 (true) / 最小化・バックグラウンド非表示 (false)
    #[serde(default = "default_visible")]
    pub is_visible: bool,
    /// ライフサイクルステートタグ ("active", "paused", "stopped")
    #[serde(default = "default_lifecycle_state")]
    pub lifecycle_state: String,
}

fn default_visible() -> bool {
    true
}

fn default_lifecycle_state() -> String {
    "active".to_string()
}

impl FmoEntry {
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

    /// モジュールステートをライフサイクル状態と統合して更新
    pub fn update_lifecycle(&mut self, state: &str, is_visible: bool) {
        self.lifecycle_state = state.to_string();
        self.is_visible = is_visible;

        // modulestate が存在する場合、lifecycleタグを付与
        let base_state = self.modulestate.as_deref().unwrap_or("shiori:running");

        // 既存の lifecycle: タグを除去して置換
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
        let mut hwndlist = Vec::new();
        if self.hwnd != 0 {
            hwndlist.push(self.hwnd);
        }
        if let Some(khwnd) = self.kerohwnd
            && khwnd != 0
            && !hwndlist.contains(&khwnd)
        {
            hwndlist.push(khwnd);
        }

        // 非表示時のサーフィスは不可視扱い（-1）へフォールバック可能だが
        // FMOレコードでは現在サーフィス値を保持しつつ modulestate で補完
        FmoRecord {
            id: self.id.clone(),
            path: String::new(),
            hwnd: self.hwnd,
            name: self.name.clone(),
            keroname: self.keroname.clone(),
            sakura_surface: self.sakura_surface,
            kero_surface: self.kero_surface,
            ghostpath: self.ghostpath.clone(),
            kerohwnd: self.kerohwnd,
            hwndlist,
            fullname: Some(self.name.clone()),
            modulestate: self.modulestate.clone(),
        }
    }

    /// FmoRecord から FmoEntry を生成する
    pub fn from_record(rec: &FmoRecord) -> Self {
        let (lifecycle_state, is_visible) = if let Some(ref ms) = rec.modulestate {
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
            id: rec.id.clone(),
            name: rec.name.clone(),
            keroname: rec.keroname.clone(),
            hwnd: rec.hwnd,
            sakura_surface: rec.sakura_surface,
            kero_surface: rec.kero_surface,
            ghostpath: rec.ghostpath.clone(),
            balloon0: String::new(),
            balloon1: String::new(),
            kerohwnd: rec.kerohwnd,
            modulestate: rec.modulestate.clone(),
            is_visible,
            lifecycle_state,
        }
    }
}
