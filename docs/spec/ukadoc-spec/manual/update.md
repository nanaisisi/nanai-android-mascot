# ネットワーク更新 (manual/update.md)

- **規格**: [manual/update.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/update.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **updates2.dau / updates.txt 解析**: `homeurl` から更新定義ファイルを取得し `parse_update_definition` にてパース。
- **物理ファイルのダウンロードと検証**: MD5 ハッシュ突合による差分ダウンロード、一時領域での検証を経て安全に既存アセットファイルを上書き・置換するアトミックファイル処理を実装 (`src-tauri/src/commands/update/network.rs`)。


## 実装箇所

- `src-tauri/tauri.conf.json:45` `"updater": {`
- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/src/main/assets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/src/lib.rs:150` `commands::update::check_ghost_update,`
- `src-tauri/src/lib.rs:151` `commands::update::execute_ghost_update,`
