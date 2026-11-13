# sstp : SSTP over HTTP

- **規格**: [http.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/http/) (ukadoc-spec/spec/sstp/http.md)
- **対応状況**: ✅ 実装済

## 突合結果

HTTP SSTP サーバなし。

## 実装箇所

- `crates/ui/src/script/parser/tests.rs:34` `\\![execute,download,http://example.com,path]\`
- `src-tauri/tauri.conf.json:9` `"devUrl": "http://localhost:1420",`
- `ui/assets/LICENSE-3RD-PARTY.html:129` `http://www.apache.org/licenses/`
- `ui/ts/ui/submenu-theme.ts:68` `relStr.startsWith("http://") ||`
- `tests/command-handler-modules.test.ts:195` `await handleCancelNetworkService(handler, ["cancel", "http", "req1"]);`
- `crates/ui/src/script/parser/tests.rs:35` `\\![execute,upload,http://example.com,path]\`
