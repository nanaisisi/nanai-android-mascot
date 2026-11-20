# 音声認識

- **規格**: [speech-recognition.md](../../../../docs/ukadoc-ssp/functions/speech-recognition.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/speech-recognition/))
- **対応状況**: ⚠️ 一部対応

Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) を用いた音声認識によるユーザー入力 (`OnUserInput`) 連携の実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [使い始める](speech-recognition/section-01.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「使い始める」 |
| [パレットの見方](speech-recognition/section-02.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「パレットの見方」 |
| [基本操作](speech-recognition/section-03.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「基本操作」 |
| [会話相手](speech-recognition/section-04.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「会話相手」 |
| [お願い](speech-recognition/section-05.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「お願い」 |
| [内容](speech-recognition/section-06.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「内容」 |
| [うまく認識されない時は](speech-recognition/section-07.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-recognition.md の「うまく認識されない時は」 |

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:58` `if (action === "speech-recognition") {`
- `ui/ts/ui/submenu-renderer.ts:187` `{ action: "speech-recognition", label: "音声認識", shortcut: "" },`
