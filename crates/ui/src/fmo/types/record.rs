//! FMO レコードモデル (`FmoRecord`)

use serde::{Deserialize, Serialize};

/// FMO レコード
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FmoRecord {
    pub(crate) id: String,
    pub(crate) path: String,
    pub(crate) hwnd: u64,
    pub(crate) name: String,
    pub(crate) keroname: String,
    pub(crate) sakura_surface: i32,
    pub(crate) kero_surface: i32,
    pub(crate) ghostpath: String,
    pub(crate) kerohwnd: Option<u64>,
    pub(crate) hwndlist: Vec<u64>,
    pub(crate) fullname: Option<String>,
    pub(crate) modulestate: Option<String>,
}

#[allow(dead_code)]
impl FmoRecord {
    pub fn id(&self) -> &str {
        &self.id
    }
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn hwnd(&self) -> u64 {
        self.hwnd
    }
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn keroname(&self) -> &str {
        &self.keroname
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
    pub fn kerohwnd(&self) -> Option<u64> {
        self.kerohwnd
    }
    pub fn hwndlist(&self) -> &[u64] {
        &self.hwndlist
    }
    pub fn fullname(&self) -> Option<&str> {
        self.fullname.as_deref()
    }
    pub fn modulestate(&self) -> Option<&str> {
        self.modulestate.as_deref()
    }

    pub fn to_core_record(&self) -> FmoRecord {
        FmoRecord {
            id: self.id.clone(),
            path: self.path.clone(),
            hwnd: self.hwnd,
            name: self.name.clone(),
            keroname: self.keroname.clone(),
            sakura_surface: self.sakura_surface,
            kero_surface: self.kero_surface,
            ghostpath: self.ghostpath.clone(),
            kerohwnd: self.kerohwnd,
            hwndlist: self.hwndlist.clone(),
            fullname: self.fullname.clone(),
            modulestate: self.modulestate.clone(),
        }
    }

    pub fn with_keroname(mut self, keroname: impl Into<String>) -> Self {
        self.keroname = keroname.into();
        self
    }

    pub fn with_fullname(mut self, fullname: Option<String>) -> Self {
        self.fullname = fullname;
        self
    }

    pub fn with_modulestate_opt(mut self, modulestate: Option<String>) -> Self {
        self.modulestate = modulestate;
        self
    }

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

    pub fn with_surfaces(mut self, sakura: i32, kero: i32) -> Self {
        self.sakura_surface = sakura;
        self.kero_surface = kero;
        self
    }

    pub fn with_hwnd(mut self, hwnd: u64, kerohwnd: Option<u64>) -> Self {
        self.hwnd = hwnd;
        self.kerohwnd = kerohwnd;
        let mut list = Vec::new();
        if hwnd != 0 {
            list.push(hwnd);
        }
        if let Some(khwnd) = kerohwnd
            && khwnd != 0
            && !list.contains(&khwnd)
        {
            list.push(khwnd);
        }
        self.hwndlist = list;
        self
    }

    pub fn with_paths(mut self, path: impl Into<String>, ghostpath: impl Into<String>) -> Self {
        self.path = path.into();
        self.ghostpath = ghostpath.into();
        self
    }

    pub fn with_modulestate(mut self, modulestate: impl Into<String>) -> Self {
        self.modulestate = Some(modulestate.into());
        self
    }
}
