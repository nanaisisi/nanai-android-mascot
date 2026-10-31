# \![execute,rss-post-URL]

- **規格**: [bang-execute-rss-post-URL.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-rss-post-URL/) (ukadoc-spec/list/sakura-script/misc/bang-execute-rss-post-URL.md)
- **検索語**: Command
- **対応状況**: ✅ 実装済

## 突合結果

\![execute,...] (RSS POST実行) コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:8` `"beforeBuildCommand": "npm run build",`
- `src-tauri/tauri.test.conf.json:7` `"beforeDevCommand": "dx serve --port 1421",`
- `src-tauri/tauri.test.conf.json:9` `"beforeBuildCommand": "dx build --release",`
