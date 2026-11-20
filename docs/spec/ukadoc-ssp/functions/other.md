# その他の機能

- **規格**: [other.md](../../../../docs/ukadoc-ssp/functions/other.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/other/))
- **対応状況**: ✅ 実装済

タスクトレイ格納（Android 常駐通知・スナップ退避）

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [MCPサーバ対応機能](other/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「MCPサーバ対応機能」 |
| [SSP内蔵のMCPサーバ](other/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「SSP内蔵のMCPサーバ」 |
| [伺かの仕様をMCPで探せるようにする](other/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「伺かの仕様をMCPで探せるようにする」 |
| [ゴーストをMCPで探せるようにする](other/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「ゴーストをMCPで探せるようにする」 |
| [AIエージェントに設定してもらう](other/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「AIエージェントに設定してもらう」 |
| [AIエージェントでゴーストを作りたい(Vibe Coding)](other/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/other.md の「AIエージェントでゴーストを作りたい(Vibe Coding)」 |

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:313` `assert!(!is_no_update_path("other.txt", &patterns));`
- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
- `ui/assets/LICENSE-3RD-PARTY.html:142` `other entities that control, are controlled by, or are under common`
- `ui/ts/ui/submenu-renderer.ts:254` `otherBtn.id = "shell-scale-other-btn";`
- `tests/app-events.test.ts:190` `globalListeners.message?.({ data: { type: "other" } });`
- `crates/nanai-surface/src/types/draw/interval.rs:86` `other => return Self::Custom(other.to_string()),`
