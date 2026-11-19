# (myballoon)/ バルーンホームディレクトリ

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: scan_balloons, resolve_balloon_dir
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myballoon)/`（ベースウェア下で全ゴーストにより共有管理されるバルーンホームディレクトリ）に対応し、`scan_balloons` が `assets/balloon/`・`balloon/`・`app_data_dir`・`resource_dir`・ゴースト同梱 `balloon/` 配下から各バルーンフォルダを走査し、`resolve_balloon_dir` がディレクトリ名・`descript.txt` の `name`・部分一致・既定フォールバック（`nam` / `default`）でホームディレクトリを解決する。なおバルーンフォルダ内部の個別ファイル仕様の突合は `balloon.md` 配下で管理する。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:36` `pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {`
- `src-tauri/src/commands/shell/balloon.rs:465` `pub fn resolve_balloon_dir(name: &str, app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {`
- `ui/ts/ui/submenu-renderer.ts:176` `invoke("scan_balloons")`
- `ui/ts/core/app-actions.ts:28` `let res = await invoke("scan_balloons").catch(() => null);`
- `tests/core-actions-boost.test.ts:115` `if (cmd === "scan_balloons") return [{ name: "B1", dir_name: "b1" }];`
