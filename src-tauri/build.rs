use std::path::Path;

fn main() {
    // WASM コアエンジンの全自動ビルド & public/wasm への配備
    build_nanai_core_wasm();

    // 32bit SHIORI ホスト (tauri_build が bundle resources を検証する前に用意する)
    build_shiori_host32();

    // Tauri build
    tauri_build::build();

    // YAYA C++統合スタブのビルド
    build_yaya_shiori_stub();
}

/// WASM コアエンジン nanai_core.wasm を自動ビルドし public/wasm/ ディレクトリへ配置する
fn build_nanai_core_wasm() {
    println!("cargo:rerun-if-changed=../crates/nanai-core/src");
    println!("cargo:rerun-if-changed=../crates/nanai-core/Cargo.toml");

    let cargo_bin = std::env::var("CARGO").unwrap_or_else(|_| "cargo".into());
    let manifest_path = "../crates/nanai-core/Cargo.toml";

    if !Path::new(manifest_path).exists() {
        return;
    }

    // デッドロック(ファイルロック待ち)回避のため独立した target-dir を使用
    let status = std::process::Command::new(cargo_bin)
        .args([
            "build",
            "--target",
            "wasm32-unknown-unknown",
            "--target-dir",
            "../target_wasm",
            "--manifest-path",
            manifest_path,
        ])
        .env_remove("CARGO_ENCODED_RUSTFLAGS")
        .env_remove("RUSTFLAGS")
        .env_remove("CARGO_BUILD_TARGET")
        .env_remove("TARGET")
        .status();

    if let Ok(s) = status {
        if s.success() {
            let wasm_src = Path::new("../target_wasm/wasm32-unknown-unknown/debug/nanai_core.wasm");
            let wasm_dst = Path::new("../public/wasm/nanai_core.wasm");

            if let Some(parent) = wasm_dst.parent() {
                let _ = std::fs::create_dir_all(parent);
            }

            if wasm_src.exists() {
                let _ = std::fs::copy(wasm_src, wasm_dst);
                // info として出力（標準エラーへの warning 出力によるノイズを防止）
                println!(
                    "cargo:info=✨ nanai_core.wasm の自動ビルド & public/wasm/ への配置に成功しました"
                );
            }
        } else {
            println!("cargo:warning=⚠️ nanai_core.wasm の自動ビルドに失敗しました");
        }
    }
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

    // ターゲットプラットフォームに基づく設定
    let target = std::env::var("TARGET").unwrap_or_default();

    if target.contains("windows") {
        // Windows固有の設定
        build
            .define("WIN32", None)
            .define("_WINDOWS", None)
            .define("_CRT_SECURE_NO_WARNINGS", None)
            .flag_if_supported("/EHsc"); // C++例外処理を有効化
    } else if target.contains("android") {
        // Android固有の設定
        build
            .define("POSIX", None)
            .define("ANDROID", None)
            .define("__ANDROID__", None)
            .flag_if_supported("-fexceptions")
            .flag_if_supported("-frtti")
            .flag_if_supported("-Wno-deprecated-declarations")
            .flag_if_supported("-Wno-unused-parameter")
            .flag_if_supported("-Wno-sign-compare");

        // Android NDK のヘッダーパス自動探索
        if let Ok(ndk) = std::env::var("NDK_HOME").or_else(|_| std::env::var("ANDROID_NDK_ROOT")) {
            let ndk_path = Path::new(&ndk);
            let sysroot = ndk_path.join("toolchains/llvm/prebuilt/windows-x86_64/sysroot");
            let sysroot_inc = sysroot.join("usr/include");
            let cxx_inc = sysroot_inc.join("c++/v1");
            let arch_inc = sysroot_inc.join("aarch64-linux-android");

            if sysroot.exists() {
                build.flag(format!("--sysroot={}", sysroot.display()));
            }
            if cxx_inc.exists() {
                build.include(&cxx_inc);
            }
            if arch_inc.exists() {
                build.include(&arch_inc);
            }
            if sysroot_inc.exists() {
                build.include(&sysroot_inc);
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
