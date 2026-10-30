# 基本的な使い方：起動する

- **規格**: [howto/boot.md](https://ukatech.shillest.net/ukadoc-ssp/howto/boot/) (ukadoc-ssp/howto/boot.md)
- **対応状況**: ✅ 実装済

## 突合結果

アプリ起動、前回終了位置・ゴーストの自動復元、常駐通知連携


## 実装箇所

- `src-tauri/src/commands/install/archive.rs:53` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別], [directory,ディレクトリ名]`
- `src-tauri/src/commands/install/archive.rs:62` `let _bootghost = map.get("bootghost");`
- `src-tauri/src/shiori/ffi/builder.rs:74` `pub fn on_boot() -> Self {`
- `src-tauri/src/shiori/ffi/builder.rs:203` `fn test_shiori_request_builder_on_boot() {`
- `src-tauri/src/shiori/ffi/builder.rs:204` `let req = ShioriRequestBuilder::on_boot().build();`
