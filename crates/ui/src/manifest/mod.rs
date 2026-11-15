//! シェルマニフェスト（Rust パース結果を JSON 化して JS / Canvas 側へ共有する層）

mod shell_manifest;
mod surface_manifest;

pub use shell_manifest::*;
pub use surface_manifest::*;

#[cfg(test)]
mod tests;
