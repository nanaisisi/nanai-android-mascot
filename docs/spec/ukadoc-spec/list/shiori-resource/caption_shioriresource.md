# SHIORI Resource

- **規格**: [caption_shioriresource.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/caption_shioriresource/)
- **検索語**: SHIORI
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/shiori/protocol/` における SHIORI 3.0 / 2.x リクエスト・レスポンスパーサーおよびヘッダ管理モデルにより、各種 SHIORI Resource（`craftman`, `name`, `version`, 状態トークン等）の送受信・処理に対応。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:11` `pub version: String, // SHIORI/3.0`
- `src-tauri/build.rs:46` `"cargo:warning=shiori-host32 のビルドに失敗: `rustup target add i686-pc-windows-msvc` を`
- `ui/ts/core/actions/ghost-actions.ts:46` `${row("SHIORI", ghost.shiori)}`
- `ui/ts/ui/spec-compliance-runner.ts:598` `"Mouse Input ➔ mouseMethods.onGhostClick / onGhostWheel ➔ detectCollision ➔ SHIO`
- `tests/balloon-events.test.ts:6` `describe("Balloon SHIORI Events and Property Integration (Slot-10)", () => {`
- `crates/nanai-core/src/shiori_protocol.rs:17` `let mut resp = format!("{} SHIORI/3.0\r\n", method.to_uppercase());`
