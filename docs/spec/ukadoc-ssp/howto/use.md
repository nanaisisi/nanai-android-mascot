# 基本的な使い方：ゴーストとあそぶ

- **規格**: [howto/use.md](https://ukatech.shillest.net/ukadoc-ssp/howto/use/) (ukadoc-ssp/howto/use.md)
- **対応状況**: ✅ 実装済

## 突合結果

タッチ/ドラッグ、クリック/ダブルクリック判定、当たり判定、着せ替え


## 実装箇所

- `src-tauri/build.rs:1` `use std::path::Path;`
- `src-tauri/build.rs:75` `.flag_if_supported("-Wno-unused-parameter")`
- `src-tauri/build_old.rs:1` `use std::path::Path;`
- `src-tauri/build_stub.rs:1` `use std::path::Path;`
- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
