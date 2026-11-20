# 旧仕様サポート

- **規格**: [index.md](../../../../ukadoc-ssp/config/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/index/))
- **検索語**: legacy
- **対応状況**: ✅ 実装済

## 突合結果

旧仕様サポート設定は未実装。


## 実装箇所

- `crates/ui/src/shiori/tests/response_tests.rs:99` `let text = "SHIORI/2.2 200 OK\r\nCharset: Shift_JIS\r\nSender: Kawari\r\nValue: `
- `ui/ts/core/actions/menu-action-dispatcher.ts:251` `if (action === "legacy-spec-support") {`
- `ui/ts/ui/submenu-renderer.ts:438` `action: "legacy-spec-support",`
- `tests/install-protocol/update-protocol.test.ts:18` `describe("install-protocol - update-protocol legacy coverage", () => {`
- `crates/ui/src/shiori/tests/response_tests.rs:103` `assert_eq!(res.value.as_deref(), Some("legacy response"));`
