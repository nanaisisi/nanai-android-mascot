use std::path::Path;
use std::collections::BTreeMap;

/// Stable public API interface for nanai-android-mascot-ui to decouple dependent components
pub trait NanaiAndroidMascotUiInterface: Send + Sync {
    /// Opens and reads a text file using VFS encoding detection
    fn open_text_file(&self, path: &Path) -> Option<String>;

    /// Parses balloon descript properties
    fn balloon_descript_map(&self, balloon_dir: &Path) -> BTreeMap<String, String>;

    /// Builds standard capability references
    fn build_standard_capability_references(&self) -> Vec<String>;
}

/// Type alias for snake_case compatibility if referenced
#[allow(non_camel_case_types)]
pub type Nanai_android_mascot_uiInterface = dyn NanaiAndroidMascotUiInterface;

/// Default implementation of NanaiAndroidMascotUiInterface
pub struct NanaiUiFacade;

impl NanaiAndroidMascotUiInterface for NanaiUiFacade {
    fn open_text_file(&self, path: &Path) -> Option<String> {
        crate::open_text_file(path).ok()
    }

    fn balloon_descript_map(&self, balloon_dir: &Path) -> BTreeMap<String, String> {
        let descript_path = balloon_dir.join("descript.txt");
        let content = self.open_text_file(&descript_path).unwrap_or_default();
        let _descript = crate::Descript::parse(&content);
        let map = BTreeMap::new();
        map
    }

    fn build_standard_capability_references(&self) -> Vec<String> {
        crate::shiori::build_standard_capability_references()
    }
}
