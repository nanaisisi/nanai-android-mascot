# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.name` キーをパースし、相方（\1）表示名 `GhostInfo.kero_name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:53` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:43` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `crates/ui/src/lib.rs:49` `let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero`
- `crates/ui/src/descript/parser.rs:56` `/// キャラクター本体名（`kero.name` または `sakura.name`）`
- `crates/ui/src/descript/parser.rs:60` `/// 相方名（`kero.name`）`
