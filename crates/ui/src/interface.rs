use std::collections::BTreeMap;
use std::path::Path;

#[allow(non_camel_case_types)]
pub trait Nanai_android_mascot_uiInterface {
    // Define stable public API

    /// Opens and reads a text file using VFS encoding detection
    fn open_text_file(&self, path: &Path) -> Option<String>;

    /// Parses balloon descript properties
    fn balloon_descript_map(&self, balloon_dir: &Path) -> BTreeMap<String, String>;

    /// Builds standard capability references
    fn build_standard_capability_references(&self) -> Vec<String>;
}

/// Default implementation of Nanai_android_mascot_uiInterface
pub struct NanaiUiFacade;

impl Nanai_android_mascot_uiInterface for NanaiUiFacade {
    fn open_text_file(&self, path: &Path) -> Option<String> {
        crate::open_text_file(path).ok()
    }

    fn balloon_descript_map(&self, balloon_dir: &Path) -> BTreeMap<String, String> {
        let descript_path = balloon_dir.join("descript.txt");
        let content = self.open_text_file(&descript_path).unwrap_or_default();
        let descript = crate::Descript::parse(&content);

        descript
            .properties()
            .clone()
            .into_iter()
            .collect::<std::collections::BTreeMap<_, _>>()
    }

    fn build_standard_capability_references(&self) -> Vec<String> {
        crate::shiori::build_standard_capability_references()
    }
}
