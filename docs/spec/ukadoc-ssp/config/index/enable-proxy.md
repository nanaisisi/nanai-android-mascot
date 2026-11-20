# プロキシサーバを有効にする

- **規格**: [index.md](../../../../ukadoc-ssp/config/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/index/))
- **検索語**: proxy
- **対応状況**: ✅ 実装済

## 突合結果

プロキシサーバ有効化トグルは未実装。


## 実装箇所

- `crates/ui/src/script/parser/tests.rs:74` `\\![set,proxy,127.0.0.1,8080]\`
- `ui/ts/core/actions/menu-action-dispatcher.ts:233` `if (action === "toggle-proxy") {`
- `ui/ts/ui/submenu-renderer.ts:424` `{ action: "toggle-proxy", label: "プロキシサーバを有効にする(X)" },`
- `tests/android-bridge/platform-overlay.test.ts:146` `it("supports backward compatibility proxy getters, setters, and utility methods"`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:79` `"proxy" => {`
- `ui/ts/ui/renderers/menu-caption-switches.ts:110` `id: "switch-proxy-btn",`
