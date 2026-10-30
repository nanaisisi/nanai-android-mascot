# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori` キーをパースし、SHIORI 動的モジュール (`GhostInfo.shiori`) へ反映する実装が行われている。

## 実装箇所

- `src-tauri/build.rs:5` `build_shiori_host32();`
- `src-tauri/build.rs:11` `build_yaya_shiori_stub();`
- `src-tauri/build.rs:14` `/// Windows 64bit ターゲット時のみ、32bit DLL 用ヘルパー shiori-host32.exe をビルドする`
- `src-tauri/build.rs:15` `fn build_shiori_host32() {`
- `src-tauri/build.rs:16` `println!("cargo:rerun-if-changed=shiori-host/src");`
