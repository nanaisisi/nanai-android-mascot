# \![anim,pause,ID]

- **規格**: [bang-anim-pause-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/bang-anim-pause-ID/) (ukadoc-spec/list/sakura-script/surface/bang-anim-pause-ID.md)
- **検索語**: \!
- **対応状況**: ✅ 実装済 (SSP「pouse」表記ゆれ受付)

## 突合結果

`ui/js/ghost/sakura-command-handler.js` が `\![anim,pause,ID]` を処理し、
指定 ID のサーフィスアニメーション (SERIKO パターン再生) を一時停止する。
`\s[ID]` 実行時（SurfaceAnimationManager.stopAnimations 経由）に解除。
定義例の「pouse」タイポ表記も受付。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js` `\![anim]` コマンド分岐 (pause / pouse / resume)
- `ui/js/surface/surface.js` `pauseAnimationById(animId, scopeId)`
- `ui/js/surface/surface-animation-manager.js` `pauseAnimation` / `isAnimationPaused` / パターン再生の一時停止ゲート
