# ショートカットを作る

- **規格**: [boot.md](../../../../ukadoc-ssp/howto/boot.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/howto/boot/))
- **検索語**: on_boot
- **対応状況**: ⚠️ 一部対応

## 突合結果

アプリ起動、前回終了位置・ゴーストの自動復元、常駐通知連携。


## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:72` `pub fn on_boot() -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:207` `let req = ShioriRequestBuilder::on_boot().build();`
