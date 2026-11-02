//! SHIORI Dynamic Loader
//!
//! Windows (DLL) および Linux/Android (.so) の SHIORI 3.0 ライブラリを動的ロード・呼び出し

mod engine;
mod host;
mod request;
mod trait_impl;

pub use engine::ShioriDynamicEngine;
