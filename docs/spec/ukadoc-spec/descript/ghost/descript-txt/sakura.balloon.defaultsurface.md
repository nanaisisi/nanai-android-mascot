# sakura.balloon.defaultsurface,数値

- **規格**: [sakura.balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.balloon.defaultsurface.md)
- **検索語**: sakura.balloon.defaultsurface
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.balloon.defaultsurface` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:96` `// [sakura.balloon.defaultsurface,数値]: sakura側規定バルーンサーフィス`
- `src-tauri/src/ghost/scan/directory/manifest.rs:98` `m.get("sakura.balloon.defaultsurface")`
- `src-tauri/src/common/models.rs:49` `/// [sakura.balloon.defaultsurface,数値]:`
