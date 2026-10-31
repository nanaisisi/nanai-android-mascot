# 基本的な使い方：起動する

- **規格**: [howto/boot.md](https://ukatech.shillest.net/ukadoc-ssp/howto/boot/) (ukadoc-ssp/howto/boot.md)
- **対応状況**: ✅ 実装済

## 突合結果

アプリ起動、前回終了位置・ゴーストの自動復元、常駐通知連携

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:74` `pub fn on_boot() -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:208` `fn test_shiori_request_builder_on_boot() {`
- `src-tauri/src/shiori/ffi/builder.rs:209` `let req = ShioriRequestBuilder::on_boot().build();`
- `tests/core.test.js:36` `state: { booted: true },`
- `tests/core.test.js:44` `assert.equal(AppConfig.state.booted, true);`
