# sakura.defaultx,X座標

- **規格**: [sakura.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaultx.md)
- **検索語**: sakura.defaultx
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.defaultx` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:38` `"sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.default`
- `crates/ui/src/descript/tests.rs:6` `sakura.defaultx,120\r\nsakura.defaulty,240\r\n\`
