# トランスレータ (manual/translator.md)

- **規格**: [translator.md](../../../ukadoc-spec/manual/translator.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/translator/))
- **検索語**: send_on_translate, OnTranslate, loadMakoto, handleLoadMakoto
- **対応状況**: ⚠️ 一部対応

SHIORI `OnTranslate` イベントの送信コマンド `send_on_translate` と `descript.txt` の `makoto` キー解析、およびさくらスクリプト `\![load,makoto,...]` 等のコマンドディスパッチ枠は存在する。一方、実体ファイルとしてのゴースト側・シェル側 `makoto.dll` の検出・DLL ロード・実行、およびバルーン表示直前に「SHIORI `OnTranslate` → ゴースト側 MAKOTO → シェル側 MAKOTO」を自動通過させるトランスレートパイプラインは未実装。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| ゴースト側 `makoto.dll`（`ghost/master/makoto.dll` 配置・実行） | ❌ 未実装 | `src-tauri/src/ghost/scan/directory/manifest/parser.rs:53` と `src-tauri/src/common/models/ghost.rs:15,64` が `descript.txt` の `makoto` 指定文字列を読み取るのみであり、`ghost/master/makoto.dll` の実ファイル探索・FFI ロード・`request` 実行は未実装 |
| シェル側 `makoto.dll`（`shell/<name>/makoto.dll` 配置・実行） | ❌ 未実装 | `src-tauri/src/ghost/scan/shell/mod.rs` での `makoto.dll` 検出、およびシェル単位での DLL ロード・実行・シェル切替時差し替えは未実装 |
| 処理順序（SHIORI `OnTranslate` → ゴースト側 MAKOTO → シェル側 MAKOTO） | ❌ 未実装 | `src-tauri/src/commands/shiori/protocol/events.rs:24-48`（`send_on_translate`）が SHIORI `OnTranslate` 単体送信を行うのみで、ゴースト側 MAKOTO・シェル側 MAKOTO への連結パイプラインは未実装 |
| 実行タイミング（バルーン表示直前のフィルタ処理） | ⚠️ 一部対応 | `src-tauri/src/invoke.rs:112` に `send_on_translate` が登録され、`ui/ts/ghost/shiori-protocol.ts:201` に `TRANSLATE: "OnTranslate"` 定数があるものの、`ui/ts/core/app-settings.ts:255-259` の `playSakuraScript` は `send_on_translate` を経由せず直接 `sakuraPlayer?.play` を呼び出しており自動フィルタは未接続 |
| ベースウェア連携（`\![load/unload/reload,makoto]`・SSTP/FMO フラグ） | ⚠️ 一部対応 | `ui/ts/ghost/command-handler/defaults/system-handlers.ts:264-282` と `ui/ts/ghost/command-handler/system/shiori.ts:101-141` が `load/unload/reload,makoto` を `ghostController.loadMakoto` 等へ委譲するフックを提供（テスト `tests/sakura-command-handler/cycle10-commands.test.ts:9`）するが、実処理は未実装。`crates/ui/src/sstp/config/ghost_config.rs:18`・`crates/ui/src/sstp/message/request/core.rs:183`・`crates/ui/src/fmo/tests/buffer_processing.rs:36` には設定型・モック記述のみ存在 |

## 実装箇所

- `src-tauri/src/commands/shiori/protocol/events.rs:24` `pub async fn send_on_translate(`
- `src-tauri/src/invoke.rs:112` `commands::shiori::send_on_translate,`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:53` `let makoto = meta_map.as_ref().and_then(|m| m.get("makoto").cloned());`
- `src-tauri/src/common/models/ghost.rs:64` `pub fn makoto(&self) -> Option<&str> {`
- `ui/ts/ghost/shiori-protocol.ts:201` `TRANSLATE: "OnTranslate",`
- `ui/ts/ghost/command-handler/system/shiori.ts:101` `export async function handleLoadMakoto(`
- `ui/ts/core/app-settings.ts:255` `playSakuraScript(script: string) {`
- `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:175` `fn test_multistage_shiori_loader_with_translator_module_state() {`
