# ghost/master/(saori).dll

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: execute_saori
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `(saori).dll`（SHIORI 機能拡張モジュール）について、`execute_saori` コマンドが内蔵 `SAORI-Ex` モジュール（`internal_time` 等）および非 Android 環境でのローカル `.dll` / `.so` ファイルロード（`DllDirectoryGuard` + `ShioriDynamicEngine` による `EXECUTE SAORI/1.0` リクエスト）と未検出時フォールバックを実装している。ただし `ghost/master/` 基準の相対パス解決やネイティブ SHIORI 実行中の自動コールバック連携ではなく、Tauri コマンド経由の明示的実行に限定される。

## 実装箇所

- `src-tauri/src/shiori/saori.rs:71` `fn execute_saori_ex_internal(params: ExecuteSaoriExInternalParams<'_>) -> Option<String> {`
- `src-tauri/src/shiori/saori.rs:133` `pub async fn execute_saori(request: SaoriRequest) -> Result<SaoriResponse, String> {`
- `src-tauri/src/shiori/saori.rs:155` `#[cfg(not(target_os = "android"))]`
- `src-tauri/src/shiori/saori.rs:230` `async fn test_execute_saori_internal() {`
- `src-tauri/src/invoke.rs:95` `shiori::saori::execute_saori,`
