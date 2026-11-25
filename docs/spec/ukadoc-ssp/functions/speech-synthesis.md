# 音声合成

- **規格**: [speech-synthesis.md](../../../../docs/ukadoc-ssp/functions/speech-synthesis.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/speech-synthesis/))
- **対応状況**: ⚠️ 一部対応

Web Speech API (`SpeechSynthesisUtterance`) を用いたさくらスクリプト発話のテキスト読み上げ（TTS）実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [使い始める](speech-synthesis/section-01.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-synthesis.md の「使い始める」 |
| [何が読み上げられるか](speech-synthesis/section-02.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-synthesis.md の「何が読み上げられるか」 |
| [声と文字を合わせる（同期）](speech-synthesis/section-03.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-synthesis.md の「声と文字を合わせる（同期）」 |
| [外部の音声合成ソフトを使う](speech-synthesis/section-04.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-synthesis.md の「外部の音声合成ソフトを使う」 |
| [声が出ない時は](speech-synthesis/section-05.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/speech-synthesis.md の「声が出ない時は」 |

## 実装箇所

- `ui/ts/core/actions/menu-action-system.ts:63` `if (action === "speech-synthesis") {`
- `ui/ts/ui/submenu-renderer.ts:188` `{ action: "speech-synthesis", label: "音声合成 (V)", shortcut: "" },`
