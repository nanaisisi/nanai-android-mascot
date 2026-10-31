# 設定：開発/その他

- **規格**: [config/dev.md](https://ukatech.shillest.net/ukadoc-ssp/config/dev/) (ukadoc-ssp/config/dev.md)
- **対応状況**: ✅ 実装済

## 突合結果

スクリプト入力パレット、ログコンソール

## 実装箇所

- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:5173",`
- `src-tauri/tauri.test.conf.json:8` `"devUrl": "http://localhost:1421",`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `src-tauri/src/commands/update/generation.rs:19` `if dev_opt_path.is_file() {`
