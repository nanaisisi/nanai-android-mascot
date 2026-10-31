# kero.defaultleft,X座標

- **規格**: [kero.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.defaultleft.md)
- **検索語**: kero.defaultleft
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.defaultleft` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property.rs:41` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
