# id,ID名

- **規格**: [id.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/id.md)
- **検索語**: id
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `id` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/build.rs:66` `} else if target.contains("android") {`
- `src-tauri/build.rs:67` `// Android固有の設定`
- `src-tauri/build.rs:78` `// Android NDK のヘッダーパス自動探索`
- `src-tauri/build.rs:84` `let arch_inc = sysroot_inc.join("aarch64-linux-android");`
- `src-tauri/tauri.conf.json:3` `"productName": "nanai-android-mascot",`
