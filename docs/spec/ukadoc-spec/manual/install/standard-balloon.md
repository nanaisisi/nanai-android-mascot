# 標準的なバルーン構成

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: flatten_balloon_directory
- **対応状況**: ✅ 実装済

## 突合結果

`inspect_zip_archive` が `type,balloon` を `assets/balloon/<dir>/` へ割り当てて展開し、`extract_ghost_archive_from_reader` 内で `flatten_balloon_directory` を実行して `balloon/` または単一ラッパーフォルダを正規化し、バルーン直下へ `descript.txt` や `balloon*.png` を配置する。`buildInstallCompleteArgs` のバルーン種別通知引数生成とテストも実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:111` `&& kind != "balloon"`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:132` `"balloon" => "assets/balloon",`
- `src-tauri/src/commands/install/archive/mod.rs:69` `if inspection.kind() == "balloon" {`
- `src-tauri/src/commands/install/utils.rs:95` `pub fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {`
- `ui/ts/core/actions/install-protocol.ts:107` `export function buildInstallCompleteArgs(`
- `tests/install-protocol/install-arguments.test.ts:29` `const defaultExtra = buildInstallCompleteArgs("balloon", "DefaultBalloon");`
