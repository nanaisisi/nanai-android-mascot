# -

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ownerdraw-item-name/entry/) (ukadoc-spec/list/shiori-resource/ownerdraw-item-name/entry.md)
- **検索語**: -
- **対応状況**: ❓ 要確認

## 突合結果

実装コードに「-」が出現。実際の処理内容は未精査(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `src-tauri/build_stub.rs:12` `println!("cargo:rerun-if-changed=../src/cpp");`
- `src-tauri/build_stub.rs:17` `build.cpp(true).std("c++17").flag_if_supported("-std=c++17");`
- `src-tauri/build_stub.rs:34` `let yaya_dir = Path::new("../src/cpp/yaya-shiori");`
- `src-tauri/build_stub.rs:42` `println!("cargo:rustc-link-lib=static=yaya_shiori_stub");`
- `src-tauri/build_old.rs:15` `let yaya_dir = Path::new("../src/cpp/yaya-shiori");`
