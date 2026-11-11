# install.accept,名前1,名前2,名前3...

- **規格**: [install.accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/install.accept.md)
- **検索語**: install.accept
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `install.accept` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:191` `m.get("install.accept")`
- `crates/ui/src/update/parser/install_manifest.rs:33` `.or_else(|| map.get("install.accept").cloned());`
