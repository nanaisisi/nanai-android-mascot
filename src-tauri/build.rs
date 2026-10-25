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

    let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo".into()))
        .args([
            "build",
            "--release",
            "--target",
            "i686-pc-windows-msvc",
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

    // Rust統合インターフェイスファイル
    build.file(cpp_interface_dir.join("yaya_rust_interface.cpp"));

    // Windows環境でのみ段階的追加用の本家YAYA基本ファイルをコンパイル
    if target.contains("windows") && yaya_dir.exists() {
        let basic_files = [
            "globalvariable.cpp",
            "basis.cpp",
            "misc.cpp",
            "crc32.c",
            "md5c.c",
            "value.cpp",
            "valuesub.cpp",
            "variable.cpp",
        ];

        for file in basic_files.iter() {
            let file_path = yaya_dir.join(file);
            if file_path.exists() {
                println!("cargo:rerun-if-changed={}", file_path.display());
                build.file(file_path);
            }
        }
    }

    // ビルド実行
    build.compile("yaya_shiori_stub");

    println!("cargo:rustc-link-lib=static=yaya_shiori_stub");
}
