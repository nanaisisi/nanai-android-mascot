# sstp : SSTP over HTTP

- **規格**: [http.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/http/) (ukadoc-spec/spec/sstp/http.md)
- **対応状況**: ❌ 未実装

## 突合結果

HTTP SSTP サーバなし。

## 実装箇所

- `src-tauri/tauri.conf.json:2` `"$schema": "https://schema.tauri.app/config/2",`
- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/tauri.test.conf.json:2` `"$schema": "https://schema.tauri.app/config/2",`
- `src-tauri/tauri.test.conf.json:8` `"devUrl": "http://localhost:1421",`
- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
