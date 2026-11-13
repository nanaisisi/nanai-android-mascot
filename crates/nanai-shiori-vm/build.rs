//! Build script for nanai-shiori-vm
//!
//! Statically compiles C++ SHIORI engines for Android / static-shiori feature.

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=../../cpp/yaya-shiori");

    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let static_shiori =
        std::env::var("CARGO_FEATURE_STATIC_SHIORI").is_ok() || target_os == "android";

    if static_shiori {
        // Static linking logic for Android & static-shiori feature
        println!("cargo:rustc-cfg=static_shiori_enabled");
    }
}
