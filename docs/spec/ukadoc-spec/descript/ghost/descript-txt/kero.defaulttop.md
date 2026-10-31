# kero.defaulttop,Y座標

- **規格**: [kero.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.defaulttop.md)
- **検索語**: kero.defaulttop
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.defaulttop` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property.rs:41` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
