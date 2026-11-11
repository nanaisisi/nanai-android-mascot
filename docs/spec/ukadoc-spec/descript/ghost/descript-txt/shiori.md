# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori` キーをパースし、SHIORI 動的モジュール (`GhostInfo.shiori`) へ反映する実装が行われている。

## 実装箇所

- `src-tauri/build.rs:16` `println!("cargo:rerun-if-changed=shiori-host/src");`
- `src-tauri/build.rs:17` `println!("cargo:rerun-if-changed=shiori-host/Cargo.toml");`
- `src-tauri/build.rs:31` `"shiori-host/Cargo.toml",`
- `src-tauri/build.rs:43` `"cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を`
- `src-tauri/build.rs:107` `let yaya_dir = Path::new("../cpp/yaya-shiori");`
