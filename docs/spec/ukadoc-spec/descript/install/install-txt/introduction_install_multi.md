# 同時インストール

- **規格**: [introduction_install_multi.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install_multi.md)
- **検索語**: 同時インストール
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` において単一アーカイブ内の複数ターゲットリソース（`ghost`, `shell`, `balloon` 等の複合インストーラ）の解析および一括展開処理が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`resolve_resources`)
