# シェル側 makoto.dll (`shell/<name>/makoto.dll`)

- **規格**: [translator.md](../../../../ukadoc-spec/manual/translator.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/translator/))
- **検索語**: shell/master/makoto.dll
- **対応状況**: ⚠️ 一部対応

## 突合結果

各シェルフォルダ直下（`shell/master/makoto.dll` や `shell/<additional_shell>/makoto.dll`）に配置するシェル側トランスレータの探索、DLL ロード、`request` 実行、およびシェル切替時のトランスレータ差し替えは未実装。`src-tauri/src/ghost/scan/shell/mod.rs` のシェルスキャン処理でも `makoto.dll` の検出・保持を行っていない。

## 実装箇所

実装コード内に「shell/master/makoto.dll」は検出されませんでした。


## 実装状況の更新

シェル側 makoto.dll の配置検出は `find_shell_makoto`（`src-tauri/src/ghost/scan/translator.rs`）および Tauri コマンド `get_makoto_translators`（`src-tauri/src/commands/shell/ghost.rs`・`src-tauri/src/invoke.rs`）で実装済み。また Windows 環境限定（`#[cfg(target_os = "windows")]`）で `execute_makoto_dll`（`src-tauri/src/shiori/makoto.rs`）および Tauri コマンド `execute_makoto_translate`（`src-tauri/src/commands/shiori/protocol/events.rs`）による `MAKOTO/2.0` C-ABI `HGLOBAL` 実行を実装し、`playSakuraScript`（`ui/ts/core/app-settings.ts`）へ統合した。Android など非 Windows 環境では未対応スタブとなるため、対応状況: ⚠️ 一部対応（Windows 限定対応・Android 非対応）。

