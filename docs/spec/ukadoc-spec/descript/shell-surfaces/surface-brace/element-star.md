# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/compatible_screen_manifest/arm64Debug/createArm64DebugCompatibleScreenManifests/output-metadata.json:9` `"elements": []`
- `src-tauri/gen/android/app/build/intermediates/linked_resources_binary_format/arm64Debug/processArm64DebugResources/output-metadata.json:9` `"elements": [`
- `src-tauri/gen/android/app/build/intermediates/linked_resources_binary_format/arm64Debug/processArm64DebugResources/output-metadata.json:19` `"elementType": "File"`
- `src-tauri/gen/android/app/build/intermediates/merged_manifests/arm64Debug/processArm64DebugManifest/output-metadata.json:9` `"elements": [`
- `src-tauri/gen/android/app/build/intermediates/merged_manifests/arm64Debug/processArm64DebugManifest/output-metadata.json:19` `"elementType": "File"`
