//! オンラインアップデートおよびインストーラー定義ファイルのパースモジュール

pub mod developer_options;
pub mod install_manifest;
pub mod update_definition;

pub use developer_options::parse_developer_options;
pub use install_manifest::parse_install_manifest;
pub use update_definition::parse_update_definition;

impl super::types::UpdatePackage {
    pub fn from_definition(content: &str) -> Self {
        Self::new(parse_update_definition(content))
    }
}
