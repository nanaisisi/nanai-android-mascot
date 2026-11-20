# shiori.cache,数値

- **規格**: [shiori.cache.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.cache.md)
- **検索語**: shiori.cache
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `shiori.cache` キーをパース・参照しキャッシュ制御を行う実装が完全に行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:118` `.and_then(|m| m.get("shiori.cache").cloned());`
