# -

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-item-name/entry/) (ukadoc-spec/list/shiori-resource/ownerdraw-item-name/entry.md)
- **検索語**: -
- **対応状況**: ❓ 要確認

## 突合結果

実装コードに「-」が出現。実際の処理内容は未精査(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `src-tauri/build.rs:14` `/// Windows 64bit ターゲット時のみ、32bit DLL 用ヘルパー shiori-host32.exe をビルドする`
- `src-tauri/build.rs:16` `println!("cargo:rerun-if-changed=shiori-host/src");`
- `src-tauri/build.rs:17` `println!("cargo:rerun-if-changed=shiori-host/Cargo.toml");`
- `src-tauri/build.rs:27` `"--release",`
- `src-tauri/build.rs:28` `"--target",`
