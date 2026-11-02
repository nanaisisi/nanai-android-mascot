# shiori.logo.x,X座標

- **規格**: [shiori.logo.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.logo.x.md)
- **検索語**: shiori.logo.x
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.logo.x` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:97` `.and_then(|m| m.get("shiori.logo.x").and_then(|v| v.trim().parse::<i32>().ok()))`
