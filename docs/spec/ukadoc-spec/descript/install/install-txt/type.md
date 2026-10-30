# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `type` キー（`ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`）をパースし、インストールターゲット種別を判定・振り分ける実装が行われている。

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/build/intermediates/compatible_screen_manifest/arm64Debug/createArm64DebugCompatibleScreenManifests/output-metadata.json:4` `"type": "COMPATIBLE_SCREEN_MANIFEST",`
- `src-tauri/gen/android/app/build/intermediates/linked_resources_binary_format/arm64Debug/processArm64DebugResources/output-metadata.json:4` `"type": "LINKED_RESOURCES_BINARY_FORMAT",`
- `src-tauri/gen/android/app/build/intermediates/linked_resources_binary_format/arm64Debug/processArm64DebugResources/output-metadata.json:11` `"type": "SINGLE",`
- `src-tauri/gen/android/app/build/intermediates/merged_manifests/arm64Debug/processArm64DebugManifest/output-metadata.json:4` `"type": "MERGED_MANIFESTS",`
