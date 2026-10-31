# \![sound,pause,ファイル名]

- **規格**: [bang-sound-pause.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/sound/bang-sound-pause/) (ukadoc-spec/list/sakura-script/sound/bang-sound-pause.md)
- **検索語**: Command
- **対応状況**: ✅ 実装済

## 突合結果

\\![sound,...] サウンド制御コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs -> SakuraCommand::Command)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/tauri.conf.json:7` `"beforeDevCommand": "npm run dev",`
- `src-tauri/tauri.conf.json:8` `"beforeBuildCommand": "npm run build",`
- `src-tauri/tauri.test.conf.json:7` `"beforeDevCommand": "dx serve --port 1421",`
- `src-tauri/tauri.test.conf.json:9` `"beforeBuildCommand": "dx build --release",`
