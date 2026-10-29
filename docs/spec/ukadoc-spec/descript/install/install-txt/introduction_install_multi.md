# 同時インストール

- **規格**: [introduction_install_multi.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/introduction_install_multi.md)
- **検索語**: 同時インストール
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` においてゴースト・バルーン等のアーカイブ内同時複数ターゲット展開処理が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs` `// [install.txt（概要）], [同時インストール]...`
