# id

- **規格**: [sound.id.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/sound-property/sound.id/)
- **検索語**: id
- **対応状況**: ❓ 要確認

## 突合結果

実装コードに「id」が出現。実際の処理内容は未精査。


## 実装箇所

- `src-tauri/build.rs:66` `} else if target.contains("android") {`
- `src-tauri/build.rs:67` `// Android固有の設定`
- `src-tauri/build.rs:78` `// Android NDK のヘッダーパス自動探索`
- `src-tauri/build.rs:84` `let arch_inc = sysroot_inc.join("aarch64-linux-android");`
- `src-tauri/tauri.conf.json:3` `"productName": "nanai-android-mascot",`
