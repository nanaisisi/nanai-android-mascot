# 同時インストール

- **規格**: [introduction_install_multi.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install_multi.md)
- **検索語**: 同時インストール
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` においてゴースト・バルーン等のアーカイブ内同時複数ターゲット展開処理が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:41` `// 同時インストール用 (kind, dest_dir, src_dir)`
- `src-tauri/src/commands/install/archive.rs:53` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別], [directory,ディレクトリ名]`
- `src-tauri/src/commands/install/archive.rs:74` `// 動的な同時インストール解析 (balloon, balloon0, plugin, shell etc.)`
