# install.accept,名前1,名前2,名前3...

- **規格**: [install.accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/install.accept.md)
- **検索語**: install.accept
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `install.accept` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:127` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [icon,ファイル名], [icon.`
- `src-tauri/src/ghost/scan/directory.rs:134` `let _accept = m.get("install.accept");`
