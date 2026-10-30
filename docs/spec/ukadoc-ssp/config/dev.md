# 設定：開発/その他

- **規格**: [config/dev.md](https://ukatech.shillest.net/ukadoc-ssp/config/dev/) (ukadoc-ssp/config/dev.md)
- **対応状況**: ✅ 実装済

## 突合結果

スクリプト入力パレット、ログコンソール


## 実装箇所

- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/tauri.test.conf.json:8` `"devUrl": "http://localhost:1421",`
- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:40` `"description": "A grouping and boundary mechanism developers can use to isolate `
