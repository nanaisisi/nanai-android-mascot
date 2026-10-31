# 設定：開発/その他

- **規格**: [config/dev.md](https://ukatech.shillest.net/ukadoc-ssp/config/dev/) (ukadoc-ssp/config/dev.md)
- **対応状況**: ✅ 実装済

## 突合結果

スクリプト入力パレット、ログコンソール

## 実装箇所

- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/tauri.test.conf.json:8` `"devUrl": "http://localhost:1421",`
- `src-tauri/src/ghost/scan/directory/filter.rs:3` `/// Check if ghost directory should be skipped due to ignore files (.dev_ignore,`
- `src-tauri/src/ghost/scan/directory/filter.rs:5` `path.join(".dev_ignore").exists()`
