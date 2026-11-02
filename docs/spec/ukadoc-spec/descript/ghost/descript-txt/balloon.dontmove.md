# balloon.dontmove,true

- **規格**: [balloon.dontmove.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/balloon.dontmove.md)
- **検索語**: balloon.dontmove
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `balloon.dontmove` キーをパース・参照する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:193` `// [balloon.dontmove,数値], [sakura.balloon.dontmove,数値], [kero.balloon.dontmove,数`
- `ui/js/core/actions/balloon-descript/layout.js:196` `props["balloon.dontmove"] === "1" ||`
- `ui/js/core/actions/balloon-descript/layout.js:197` `props["balloon.dontmove"]?.toLowerCase() === "true" ||`
- `ui/js/core/actions/balloon-descript/layout.js:198` `props["sakura.balloon.dontmove"] === "1" ||`
- `ui/js/core/actions/balloon-descript/layout.js:199` `props["sakura.balloon.dontmove"]?.toLowerCase() === "true" ||`
