# install.accept,名前1,名前2,名前3...

- **規格**: [install.accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/install.accept.md)
- **検索語**: install.accept
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/update/parser/install_manifest.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `install.accept` ディレクティブのパース・取得および転送・拒否判定 (`OnInstallRefuse` / `OnInstallReroute`) が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:86` `/// インストール受け入れゴースト名一覧 (`install.accept`)`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:161` `m.get("install.accept")`
- `crates/nanai-core/src/descript_parser/types.rs:88` `if let Some(val) = self.get("install.accept") {`
- `crates/ui/src/update/parser/install_manifest.rs:33` `.or_else(|| map.get("install.accept").cloned());`
