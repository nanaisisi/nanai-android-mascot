use std::path::Path;

fn main() {
    // 32bit SHIORI ホスト (tauri_build が bundle resources を検証する前に用意する)
    build_shiori_host32();

    // Tauri build
    tauri_build::build();

    // YAYA C++統合スタブのビルド
    build_yaya_shiori_stub();
}

/// Windows 64bit ターゲット時のみ、32bit DLL 用ヘルパー shiori-host32.exe をビルドする
fn build_shiori_host32() {
    println!("cargo:rerun-if-changed=shiori-host/src");
    println!("cargo:rerun-if-changed=shiori-host/Cargo.toml");

    let target = std::env::var("TARGET").unwrap_or_default();
    if !target.contains("windows") || !target.starts_with("x86_64") {
        return;
    }

    // デッドロック(ファイルロック待ち)回避のため独立した target-dir を使用
    let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo".into()))
        .args([
            "build",
            "--release",
            "--target",
            "i686-pc-windows-msvc",
            "--target-dir",
            "../target_shiori_host",
            "--manifest-path",
            "shiori-host/Cargo.toml",
        ])
        // 親ビルドの設定を引き継がない
        .env_remove("CARGO_ENCODED_RUSTFLAGS")
        .env_remove("RUSTFLAGS")
        .env_remove("CARGO_BUILD_TARGET")
        .env_remove("TARGET")
        .status();

    match status {
        Ok(s) if s.success() => {}
        _ => println!(
            "cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を実行してください (32bit SHIORI DLL が使えません)"
        ),
    }
}

fn build_yaya_shiori_stub() {
    println!("cargo:rerun-if-changed=../cpp");

    let mut build = cc::Build::new();

    // C++標準とコンパイラ設定
    build.cpp(true).std("c++17");

    let target = std::env::var("TARGET").unwrap_or_default();
    if target.contains("windows") {
        build.define("WIN32", None);
        let target_env = std::env::var("CARGO_CFG_TARGET_ENV").unwrap_or_default();
        if target_env == "msvc" {
            build.flag("-EHsc");
        } else {
            build.flag("-mthreads");
        }
    } else if target.contains("darwin") {
        let sysroot_output = std::process::Command::new("xcrun")
            .args(["--sdk", "macosx", "--show-sdk-path"])
            .output();
        if let Ok(output) = sysroot_output {
            let sysroot = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !sysroot.is_empty() {
                build.flag(format!("-isysroot{}", sysroot));
            }
        }
    } else if target.contains("linux") {
        build
            .define("POSIX", None)
            .flag_if_supported("-fexceptions")
            .flag_if_supported("-frtti");
    }

    let cpp_interface_dir = Path::new("../cpp");
    let yaya_dir = Path::new("../cpp/yaya-shiori");

    // YAYAディレクトリをインクルードパスに追加
    if yaya_dir.exists() {
        build.include(yaya_dir);
    }
    build.include(cpp_interface_dir);

    // Rust統合インターフェイス（スタブ実装を使用）
    build.file(cpp_interface_dir.join("yaya_rust_interface_stub.cpp"));

    // ビルド実行
    build.compile("yaya_shiori_stub");

    println!("cargo:rustc-link-lib=static=yaya_shiori_stub");
}
