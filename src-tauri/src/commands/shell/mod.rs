//! シェルマニフェスト取得コマンド（Rust パース結果の JS 側への提供）
//!
//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）
//! を `nanai_android_mascot_ui::Shell` でパースし、
//! `ShellManifest`（serde JSON）としてフロントエンドへ返す。

pub mod animation;
pub mod balloon;
pub mod ghost;
pub mod manifest;

pub use animation::*;
pub use balloon::*;
pub use ghost::*;
pub use manifest::*;
