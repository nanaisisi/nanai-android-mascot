//! SHIORI/3.0 エンジン抽象レイヤー (Slot-02 Contract)
//!
//! SHIORI C-ABI DLL, WASM, およびモック/スクリプトエンジンを統一的に扱う抽象トレイト `ShioriEngine`
//! ならびに多段フォールバックローダー `MultiStageShioriLoader` を提供する。

pub mod loader;
pub mod mock;
pub mod native;
pub mod state;
pub mod trait_def;

#[cfg(test)]
mod tests;

pub use loader::{CandidateKind, LoadAttempt, MultiStageShioriLoader, ShioriEngineCandidate};
pub use mock::MockShioriEngine;
pub use native::NativeShioriEngine;
pub use state::{ShioriLifecycleState, build_standard_capability_references};
pub use trait_def::ShioriEngine;
