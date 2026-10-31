# 設定：メール

- **規格**: [config/pop.md](https://ukatech.shillest.net/ukadoc-ssp/config/pop/) (ukadoc-ssp/config/pop.md)
- **対応状況**: ✅ 実装済

## 突合結果

メールチェック（POP3/IMAP）接続設定、OnBIFF* パイプライン

## 実装箇所

- `src-tauri/src/commands/window/menu_native.rs:96` `window.popup_menu(&menu).map_err(|e| e.to_string())?;`
- `src-tauri/src/common/paths.rs:154` `components.pop();`
- `src-tauri/src/shiori/property.rs:39` `"sakura.popupmenu.applybindtoself" | "sakura.popupmenu.type" | "sakura.popupmenu`
- `src-tauri/src/shiori/property.rs:42` `"kero.popupmenu.applybindtoself" | "kero.popupmenu.type" | "kero.popupmenu.visib`
- `src-tauri/src/shiori/property.rs:45` `"char.popupmenu.applybindtoself" | "char.popupmenu.type" | "char.popupmenu.visib`
