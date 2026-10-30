# accept,本体側名

- **規格**: [accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/accept.md)
- **検索語**: accept
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `accept` キーをパースし、受け入れベースウェア判定を行う実装が行われている。

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/src/main/assets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/schemas/android-schema.json:4` `"description": "Capability formats accepted in a capability file.",`
- `src-tauri/gen/schemas/desktop-schema.json:4` `"description": "Capability formats accepted in a capability file.",`
- `src-tauri/gen/schemas/mobile-schema.json:4` `"description": "Capability formats accepted in a capability file.",`
