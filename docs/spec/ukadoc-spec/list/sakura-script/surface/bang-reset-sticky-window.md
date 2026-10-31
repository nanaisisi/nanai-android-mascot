# \![reset,sticky-window]

- **規格**: [bang-reset-sticky-window.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-reset-sticky-window/) (ukadoc-spec/list/sakura-script/surface/bang-reset-sticky-window.md)
- **検索語**: Command
- **対応状況**: ✅ 実装済

## 突合結果

サーフェス・ウィンドウ位置・エフェクト関連スクリプトコマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:8` `"beforeBuildCommand": "npm run build",`
- `src-tauri/tauri.test.conf.json:7` `"beforeDevCommand": "dx serve --port 1421",`
- `src-tauri/tauri.test.conf.json:9` `"beforeBuildCommand": "dx build --release",`
