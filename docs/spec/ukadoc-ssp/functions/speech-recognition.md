# 音声認識

- **規格**: [functions/speech-recognition.md](https://ukatech.shillest.net/ukadoc-ssp/functions/speech-recognition/) (ukadoc-ssp/functions/speech-recognition.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) を用いた音声認識によるユーザー入力 (`OnUserInput`) 連携の実装完了。

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:58` `if (action === "speech-recognition") {`
- `ui/ts/ui/submenu-renderer.ts:187` `{ action: "speech-recognition", label: "音声認識", shortcut: "" },`
