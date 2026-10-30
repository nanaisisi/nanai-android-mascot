# 設定：音声認識/合成

- **規格**: [config/dictation.md](https://ukatech.shillest.net/ukadoc-ssp/config/dictation/) (ukadoc-ssp/config/dictation.md)
- **対応状況**: ✅ 対応済

## 突合結果

Web Speech API を用いた音声合成（TTS）および音声認識（Dictation）マネージャー (`ui/js/core/actions/dictation.js`) による音声認識・合成機能の実装完了。


## 実装箇所

- `ui/main.js:5` `import { DictationManager } from "./js/core/actions/dictation.js";`
- `ui/main.js:50` `this.dictationManager = new DictationManager(this);`
- `ui/js/core/actions/dictation.js:2` `* @file dictation.js`
- `ui/js/core/actions/dictation.js:4` `* [config/dictation.md], [functions/speech-recognition.md], [functions/speech-sy`
- `ui/js/core/actions/dictation.js:32` `emit("dictation-result", { text });`
