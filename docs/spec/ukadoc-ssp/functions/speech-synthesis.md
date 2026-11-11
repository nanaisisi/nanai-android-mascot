# 音声合成

- **規格**: [functions/speech-synthesis.md](https://ukatech.shillest.net/ukadoc-ssp/functions/speech-synthesis/) (ukadoc-ssp/functions/speech-synthesis.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

Web Speech API (`SpeechSynthesisUtterance`) を用いたさくらスクリプト発話のテキスト読み上げ（TTS）実装完了。

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:63` `if (action === "speech-synthesis") {`
- `ui/ts/ui/submenu-renderer.ts:188` `{ action: "speech-synthesis", label: "音声合成 (V)", shortcut: "" },`
