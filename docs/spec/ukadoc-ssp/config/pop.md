# 設定：メール

- **規格**: [config/pop.md](https://ukatech.shillest.net/ukadoc-ssp/config/pop/) (ukadoc-ssp/config/pop.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

メールチェック（POP3/IMAP）接続設定、OnBIFF* パイプライン

## 実装箇所

- `src-tauri/src/common/paths.rs:154` `components.pop();`
- `crates/nanai-vfs/src/path.rs:49` `parts.pop();`
- `crates/nanai-vfs/src/path.rs:143` `current.pop();`
- `crates/nanai-vfs/src/resolver/path_resolution.rs:80` `current.pop();`
- `crates/ui/src/vfs/path.rs:49` `parts.pop();`
