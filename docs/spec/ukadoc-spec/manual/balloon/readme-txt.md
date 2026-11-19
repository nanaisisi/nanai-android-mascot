# `readme.txt` (バルーン)

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: get_balloon_readme
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `readme.txt`（バルーン配布元などを記載し、インストール時やベースウェアのメニュー等から参照できるファイル）に対し、バックエンドの読み込み API まで実装済みだが UI からの閲覧連携は未実装。`scan_balloons` (`src-tauri/src/commands/shell/balloon.rs:127-136`) は `readme.txt` / `Readme.txt` / `README.TXT` を `BalloonInfo.readme` へ読み込み、`get_balloon_readme` (`src-tauri/src/commands/shell/balloon.rs:166`, `src-tauri/src/invoke.rs:25`) も公開されている。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:122-126`) も `readme` / `readme.charset` を CSS 変数へ設定する。しかし `ui/ts/ui/modal-ghost-handlers.ts:190-236` のバルーン選択 UI や `ui/ts/ui/submenu-renderer.ts:150-188` から `readme` を表示する処理は未連携であり、`\![open,readme]` (`ui/ts/ghost/command-handler/system/target.ts:158-179`) もゴースト側のみを対象としている。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:127` `let readme = ["readme.txt", "Readme.txt", "README.TXT"]`
- `src-tauri/src/commands/shell/balloon.rs:166` `pub fn get_balloon_readme(`
- `src-tauri/src/invoke.rs:25` `commands::shell::get_balloon_readme,`
- `ui/ts/core/actions/balloon-descript/assets.ts:122` `if (p.readme) root.style.setProperty("--balloon-readme", p.readme);`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:144` `assert.equal(styleMap.get("--balloon-readme"), "readme.txt");`
