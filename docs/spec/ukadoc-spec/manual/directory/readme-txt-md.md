# readme.txt または readme.md

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: readme.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/readme.txt` または `readme.md` について、バルーン側では `scan_balloons` / `get_balloon_readme` が `readme.txt`（大文字小文字バリエーション含む）を読み込む。一方ゴースト側では、`\![open,readme]` ハンドラ（`target.ts`）が `readme.txt` 固定で `invoke("open_path", ...)` を呼び出すものの、Rust 側（`src-tauri/src/invoke.rs`）に `open_path` コマンドが未登録であり、`readme.md` の Markdown 装飾表示・相対パスの画像埋込記法・インストール時自動表示も未実装。

## 実装箇所

- `ui/ts/ghost/command-handler/system/target.ts:168` `const currentGhost = handler.app.ghostController?.currentGhost;`
- `ui/ts/ghost/command-handler/system/target.ts:174` `await invoke("open_path", { path: docPath });`
- `src-tauri/src/commands/shell/balloon.rs:127` `let readme = ["readme.txt", "Readme.txt", "README.TXT"]`
- `src-tauri/src/commands/shell/balloon.rs:171` `for f in ["readme.txt", "Readme.txt", "README.TXT"] {`
- `src-tauri/src/commands/install/archive/packaging.rs:148` `fs::write(source_dir.join("readme.txt"), "Ghost Readme\n").unwrap();`
