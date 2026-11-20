# 声と文字を合わせる（同期）

- **規格**: [speech-synthesis.md](../../../../../docs/ukadoc-ssp/functions/speech-synthesis.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/speech-synthesis/))
- **対応状況**: ⚠️ 一部対応

## 突合結果

docs/ukadoc-ssp/functions/speech-synthesis.md の「声と文字を合わせる（同期）」に関する仕様項目。 Web Speech API (`SpeechSynthesisUtterance`) を用いたさくらスクリプト発話のテキスト読み上げ（TTS）実装完了。

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:63` `if (action === "speech-synthesis") {`
- `ui/ts/ui/submenu-renderer.ts:188` `{ action: "speech-synthesis", label: "音声合成 (V)", shortcut: "" },`
