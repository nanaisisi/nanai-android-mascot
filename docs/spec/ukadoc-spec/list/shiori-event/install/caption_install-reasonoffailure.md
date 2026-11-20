# インストールの失敗理由

- **規格**: [caption_install-reasonoffailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/caption_install-reasonoffailure/) (ukadoc-spec/list/shiori-event/install/caption_install-reasonoffailure.md)
- **検索語**: インストールの失敗理由
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「インストールの失敗理由 (`InstallFailureReason`)」を標準型および正規化関数として完全実装。

## 実装箇所

- `crates/nanai-core/src/install_protocol/types.rs` (`InstallFailureReason` enum / `INSTALL_FAILURE_REASONS`)
- `ui/ts/core/actions/install-protocol.ts` (`INSTALL_FAILURE_REASONS` / `normalizeInstallFailureReason`)
