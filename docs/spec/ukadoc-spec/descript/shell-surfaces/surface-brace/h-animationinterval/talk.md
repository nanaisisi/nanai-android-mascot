# talk,数値

- **規格**: [talk.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/talk.md)
- **検索語**: talk
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `ui/js/surface/character.js:58` `emitFn("menu-action", { action: "talk", payload: { scope: scopeId } });`
- `ui/js/surface/surface-animation-manager.js:98` `intervalStr.startsWith("talk") ||`
- `ui/js/surface/surface-animation-manager.js:162` (コメント) `* 発話（文字送り）時の口パク連動 (interval talk,N 準拠)`
- `ui/js/surface/surface-animation-manager.js:168` `const talkAnim = animList.find((a) =>`
- `ui/js/surface/surface-animation-manager.js:169` `(a.interval || "").startsWith("talk")`
