# 設定：IM

- **規格**: [config/im.md](https://ukatech.shillest.net/ukadoc-ssp/config/im/) (ukadoc-ssp/config/im.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

SSTP 待ち受けポート（9801/9821）設定

## 実装箇所

- `src-tauri/build_old.rs:132` `println!("cargo:warning=SATORIYA shiori build is not yet implemented");`
- `src-tauri/tauri.conf.json:24` `"minimizable": false,`
- `src-tauri/tauri.conf.json:25` `"maximizable": false,`
- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/build/intermediates/merged_res_blame_folder/arm64Debug/mergeArm64DebugResources/out/multi-v2/mergeArm64DebugResources.json:4620` `"source": "C:\\Users\\user\\.gradle\\caches\\9.6.1\\transforms\\24f96ce3c49f3e7`
