//! シェルマニフェスト取得コマンド（Rust パース結果の JS 側への提供）
//!
//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）
//! を `nanai_android_mascot_ui::Shell` でパースし、
//! `ShellManifest`（serde JSON）としてフロントエンドへ返す。



pub use crate::common::paths::{
    open_text_file, resolve_asset_path, resolve_ghost_directory, resolve_vfs_path,
};

pub mod animation;
pub mod balloon;
pub mod compositor;
pub mod ghost;
pub mod manifest;

pub use animation::*;
pub use balloon::*;
#[allow(unused_imports)]
pub use compositor::*;
pub use ghost::*;
pub use manifest::*;

#[cfg(test)]
mod tests {
    #[test]
    fn test_shell_commands_module() {
        // Module availability verification
    }
}
