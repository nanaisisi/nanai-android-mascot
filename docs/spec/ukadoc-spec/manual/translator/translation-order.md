# トランスレート実行順序・タイミング

- **規格**: [translator.md](../../../../ukadoc-spec/manual/translator.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/translator/))
- **検索語**: send_on_translate, OnTranslate, playSakuraScript
- **対応状況**: ⚠️ 一部対応

## 突合結果

SHIORI へ `OnTranslate` イベントを送信し翻訳済みスクリプトを返す Tauri コマンド `send_on_translate`（`src-tauri/src/commands/shiori/protocol/events.rs:24-48`・`src-tauri/src/invoke.rs:112`）、イベント名定数 `SHIORI_EVENTS.TRANSLATE`（`ui/ts/ghost/shiori-protocol.ts:201`）、および SSTP 制御フラグ `sstp.alwaystranslate` / `notranslate`（`crates/ui/src/sstp/config/ghost_config.rs:18`・`crates/ui/src/sstp/message/request/core.rs:183`）が実装されている（テスト `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:175-209` でも `OnTranslate` 応答を確認）。一方で、バルーン表示直前に「SHIORI `OnTranslate` → ゴースト側 MAKOTO → シェル側 MAKOTO」の順序（ゴースト・シェル両方存在時はゴースト側 → シェル側の順）で文字列を変換する自動トランスレートパイプラインは未実装であり、`ui/ts/core/app-settings.ts:255-259` の `playSakuraScript` も `send_on_translate` を自動経由せず直接 `sakuraPlayer?.play(script)` を呼び出している。

## 実装箇所

- `src-tauri/src/commands/shiori/protocol/events.rs:24` `pub async fn send_on_translate(`
- `src-tauri/src/invoke.rs:112` `commands::shiori::send_on_translate,`
- `ui/ts/ghost/shiori-protocol.ts:201` `TRANSLATE: "OnTranslate",`
- `ui/ts/core/app-settings.ts:255` `playSakuraScript(script: string) {`
- `crates/ui/src/sstp/config/ghost_config.rs:18` `/// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0`
- `crates/ui/src/shiori/engine/tests/multistage_loader/fallback_reload/full_coverage.rs:175` `fn test_multistage_shiori_loader_with_translator_module_state() {`


## 実装状況の更新

適用順序（SHIORI → ゴースト側 → シェル側）は `translate_order`（`src-tauri/src/ghost/scan/translator.rs`）で定義。MAKOTO 段の実行は DLL 不可のため、UI 自動パイプライン接続と併せて ⚠️ 一部対応のまま据え置く。
