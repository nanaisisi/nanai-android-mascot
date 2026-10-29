# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/shiori/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/build_stub.rs:8` `build_yaya_shiori_stub();`
- `src-tauri/build_stub.rs:11` `fn build_yaya_shiori_stub() {`
- `src-tauri/build_stub.rs:34` `let yaya_dir = Path::new("../src/cpp/yaya-shiori");`
- `src-tauri/build_stub.rs:40` `build.compile("yaya_shiori_stub");`
- `src-tauri/build_stub.rs:42` `println!("cargo:rustc-link-lib=static=yaya_shiori_stub");`
