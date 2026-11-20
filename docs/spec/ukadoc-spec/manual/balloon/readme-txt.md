# `readme.txt` (バルーン)

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: get_balloon_readme
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `readme.txt`（バルーン配布元などを記載し、インストール時やベースウェアのメニュー等から参照できるファイル）に対応済み。`scan_balloons` (`src-tauri/src/commands/shell/balloon.rs`) は `read_balloon_readme_from_dir` 経由で `readme.txt` / `Readme.txt` / `README.TXT` を `BalloonInfo.readme` へ読み込み、`get_balloon_readme` (`src-tauri/src/commands/shell/balloon.rs`, `src-tauri/src/invoke.rs`) も公開されている。`ModalGhostHandlers.renderBalloonList` (`ui/ts/ui/modal-ghost-handlers.ts`) の `README` ボタンから `get_balloon_readme` を呼び出してモーダル表示する。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:122-126`) も `readme` / `readme.charset` を CSS 変数へ設定する。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` `read_balloon_readme_from_dir` / `get_balloon_readme`
- `src-tauri/src/invoke.rs` `commands::shell::get_balloon_readme,`
- `ui/ts/ui/modal-ghost-handlers.ts` `renderBalloonList` (`balloon-readme-btn` / `openTextDocument`)
- `ui/ts/core/actions/balloon-descript/assets.ts:122` `if (p.readme) root.style.setProperty("--balloon-readme", p.readme);`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:144` `assert.equal(styleMap.get("--balloon-readme"), "readme.txt");`
