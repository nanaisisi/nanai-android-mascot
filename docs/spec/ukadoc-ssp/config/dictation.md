# 設定：音声認識/合成

- **規格**: [config/dictation.md](https://ukatech.shillest.net/ukadoc-ssp/config/dictation/) (ukadoc-ssp/config/dictation.md)
- **対応状況**: ✅ 実装済

## 突合結果

Web Speech API を用いた音声合成（TTS）および音声認識（Dictation）マネージャー (`ui/js/core/actions/dictation.js`) による音声認識・合成機能の実装完了。

## 実装箇所

- `ui/main.ts:12` `import { DictationManager } from "./ts/core/actions/dictation.js";`
- `ui/ts/core/actions/dictation.ts:39` `emit("dictation-result", { text });`
- `ui/ts/core/actions/dictation.ts:48` `emit("dictation-ended", {});`
- `ui/ts/core/actions/dictation.ts:59` `emit("dictation-started", {});`
- `ui/ts/ui/renderers/menu-caption-general.ts:150` `id: "dictation-btn",`
