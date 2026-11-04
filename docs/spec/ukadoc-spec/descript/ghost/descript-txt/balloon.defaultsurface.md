# balloon.defaultsurface,数値

- **規格**: [balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/balloon.defaultsurface.md)
- **検索語**: balloon.defaultsurface
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `balloon.defaultsurface` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:90` `// [balloon.defaultsurface,数値]: 全身・ベース規定バルーンサーフィス`
- `src-tauri/src/ghost/scan/directory/manifest.rs:92` `m.get("balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:96` `// [sakura.balloon.defaultsurface,数値]: sakura側規定バルーンサーフィス`
- `src-tauri/src/ghost/scan/directory/manifest.rs:98` `m.get("sakura.balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:102` `// [kero.balloon.defaultsurface,数値]: kero側規定バルーンサーフィス`
