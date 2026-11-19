# インストールの識別子

- **規格**: [caption_install-identifier.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/caption_install-identifier/) (ukadoc-spec/list/shiori-event/install/caption_install-identifier.md)
- **検索語**: インストールの識別子
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「インストールの識別子 (`InstallIdentifier`)」を標準型および正規化関数として完全実装。

## 実装箇所

- `crates/nanai-core/src/install_protocol/types.rs` (`InstallIdentifier` enum / `INSTALL_IDENTIFIERS`)
- `ui/ts/core/actions/install-protocol.ts` (`INSTALL_IDENTIFIERS` / `normalizeInstallType`)
