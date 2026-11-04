# kero.balloon.defaultsurface,数値

- **規格**: [kero.balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.balloon.defaultsurface.md)
- **検索語**: kero.balloon.defaultsurface
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.balloon.defaultsurface` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:102` `// [kero.balloon.defaultsurface,数値]: kero側規定バルーンサーフィス`
- `src-tauri/src/ghost/scan/directory/manifest.rs:104` `m.get("kero.balloon.defaultsurface")`
- `src-tauri/src/common/models.rs:51` `/// [kero.balloon.defaultsurface,数値]:`
