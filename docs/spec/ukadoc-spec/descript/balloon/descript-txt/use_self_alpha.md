# use_self_alpha,値

- **規格**: [use_self_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/use_self_alpha.md)
- **検索語**: use_self_alpha
- **対応状況**: ✅ 対応済

## 突合結果

PNA マスク合成および Canvas 2D レンダラにおいてアルファチャンネル透過処理を完備。


## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:106` `// [seriko.dpi,推奨DPI], [seriko.zorder,スコープID,スコープID,...], [seriko.sticky-window,`
- `ui/js/core/actions/balloon-descript/assets.js:127` `// [use_self_alpha,値]:`
- `ui/js/core/actions/balloon-descript/assets.js:129` `props.use_self_alpha === "1" ||`
- `ui/js/core/actions/balloon-descript/assets.js:130` `props.use_self_alpha?.toLowerCase() === "true";`
- `tests/balloon-descript.test.js:131` `use_self_alpha: "true",`
