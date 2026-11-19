# install.accept,名前1,名前2,名前3...

- **規格**: [install.accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/install.accept.md)
- **検索語**: install.accept
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/update/parser/install_manifest.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `install.accept` ディレクティブのパース・取得および転送・拒否判定 (`OnInstallRefuse` / `OnInstallReroute`) が完全実装済み。

## 実装箇所

- `crates/ui/src/update/parser/install_manifest.rs` (`install.accept`)
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`install.accept`)
