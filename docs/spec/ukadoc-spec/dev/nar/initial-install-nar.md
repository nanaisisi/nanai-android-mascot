# initial_install.narによるサイレントインストールについて

- **規格**: [nar.md](../../../../ukadoc-spec/dev/nar.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/nar/))
- **検索語**: initial_install.nar
- **対応状況**: ⚠️ 一部対応

## 突合結果

通常の .nar インストール経路は実装済みだが、initial_install.nar 専用の自動サイレント起動は未確認。

## 実装箇所

- `src-tauri/src/commands/web.rs:41`
