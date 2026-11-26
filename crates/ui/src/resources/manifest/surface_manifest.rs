//! 1サーフィス分のマニフェスト (`SurfaceManifest`)

use nanai_surface::SurfaceDefinition;
use serde::{Deserialize, Serialize};

/// 1サーフィス分のマニフェスト（番号 + 定義 + 表示名）
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceManifest {
    /// サーフィス番号
    pub(crate) number: u32,
    /// `surfaces.txt` の `name,` / surfacetable の表示名（無ければ None）
    pub(crate) name: Option<String>,
    /// element / animation / collision / point 定義
    pub(crate) definition: SurfaceDefinition,
}

impl SurfaceManifest {
    pub fn number(&self) -> u32 {
        self.number
    }
    pub fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }
    pub fn definition(&self) -> &SurfaceDefinition {
        &self.definition
    }

    pub fn new(number: u32, name: Option<String>, definition: SurfaceDefinition) -> Self {
        Self {
            number,
            name,
            definition,
        }
    }
}
