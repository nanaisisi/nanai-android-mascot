# \![anim,resume,ID]

- **規格**: [bang-anim-resume-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-resume-ID/) (ukadoc-spec/list/sakura-script/surface/bang-anim-resume-ID.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/ghost/sakura-command-handler.js` が `\![anim,resume,ID]` を処理し、
`\![anim,pause,ID]` (pouse 含む) で一時停止したサーフィスアニメーションを再開する。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js` `\![anim]` コマンド分岐 (resume)
- `ui/js/surface/surface.js` `resumeAnimationById(animId, scopeId)`
- `ui/js/surface/surface-animation-manager.js` `resumeAnimation` (一時停止ゲート解除)
