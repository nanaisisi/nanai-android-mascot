# 設定：メール

- **規格**: [config/pop.md](https://ukatech.shillest.net/ukadoc-ssp/config/pop/) (ukadoc-ssp/config/pop.md)
- **対応状況**: ✅ 実装済

## 突合結果

メールチェック（POP3/IMAP）接続設定、OnBIFF* パイプライン

## 実装箇所

- `src-tauri/src/commands/window/menu_native.rs:96` `window.popup_menu(&menu).map_err(|e| e.to_string())?;`
- `src-tauri/src/common/paths.rs:154` `components.pop();`
- `crates/ui/src/vfs.rs:46` `current.pop();`
- `ui/js/ghost/shiori-notify.js:103` `.pop();`
- `ui/js/surface/surface-load.js:171` `const ghostName = basePath.split(/[\\/]/).filter(Boolean).pop() || "";`
