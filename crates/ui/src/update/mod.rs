pub mod engine;
pub mod parser;
pub mod types;
pub mod validation;

pub use engine::{InstallerEngine, StandardInstallerEngine};
pub use parser::{parse_install_manifest, parse_update_definition};
pub use types::{InstallManifest, InstallResourceConfig, UpdateEntry, UpdatePackage};
pub use validation::validate_archive_entry_path;

#[cfg(test)]
mod tests;
