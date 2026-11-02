# balloon.syncscale,true

- **規格**: [balloon.syncscale.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/balloon.syncscale.md)
- **検索語**: balloon.syncscale
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `balloon.syncscale` キーをパース・参照する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:205` `// [balloon.syncscale,true], [sakura.balloon.syncscale,true], [kero.balloon.sync`
- `ui/js/core/actions/balloon-descript/layout.js:208` `props["balloon.syncscale"] === "1" ||`
- `ui/js/core/actions/balloon-descript/layout.js:209` `props["balloon.syncscale"]?.toLowerCase() === "true" ||`
- `ui/js/core/actions/balloon-descript/layout.js:210` `props["sakura.balloon.syncscale"] === "1" ||`
- `ui/js/core/actions/balloon-descript/layout.js:211` `props["sakura.balloon.syncscale"]?.toLowerCase() === "true" ||`
