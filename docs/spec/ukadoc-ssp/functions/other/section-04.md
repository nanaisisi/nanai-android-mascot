# ゴーストをMCPで探せるようにする

- **規格**: [other.md](../../../../../docs/ukadoc-ssp/functions/other.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/other/))
- **対応状況**: ✅ 実装済

## 突合結果

docs/ukadoc-ssp/functions/other.md の「ゴーストをMCPで探せるようにする」に関する仕様項目。 タスクトレイ格納（Android 常駐通知・スナップ退避）

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:313` `assert!(!is_no_update_path("other.txt", &patterns));`
- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
- `ui/assets/LICENSE-3RD-PARTY.html:142` `other entities that control, are controlled by, or are under common`
- `ui/ts/ui/submenu-renderer.ts:254` `otherBtn.id = "shell-scale-other-btn";`
- `tests/app-events.test.ts:190` `globalListeners.message?.({ data: { type: "other" } });`
- `crates/nanai-surface/src/types/draw/interval.rs:86` `other => return Self::Custom(other.to_string()),`
