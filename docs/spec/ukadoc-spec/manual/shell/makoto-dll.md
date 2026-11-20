# `shell/master/makoto.dll`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: shell/master/makoto.dll
- **対応状況**: ⚠️ 一部対応（Windows 限定対応・Android 非対応）

## 突合結果

シェルフォルダ直下の `shell/<name>/makoto.dll` の検出は `find_shell_makoto`（`src-tauri/src/ghost/scan/translator.rs`）で実装済みであり、Windows 環境限定（`#[cfg(target_os = "windows")]`）で `execute_makoto_dll`（`src-tauri/src/shiori/makoto.rs`）および `execute_makoto_translate`（`src-tauri/src/commands/shiori/protocol/events.rs`）による `MAKOTO/2.0` トランスレート実行に対応している。Android など非 Windows 環境では未対応。

## 実装箇所

実装コード内に「shell/master/makoto.dll」は検出されませんでした。
