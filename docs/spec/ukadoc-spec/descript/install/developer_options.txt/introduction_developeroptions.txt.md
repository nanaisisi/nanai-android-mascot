# developer_options.txt

- **規格**: [introduction_developeroptions.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt/) (ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt.md)
- **検索語**: developer_options.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `developer_options.txt` を読み込み、開発者向け除外・制御フラグ行を抽出・適用する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:62` `// [developer_options.txt], [自動的に除外される対象], [相対パス,オプション1,オプション2,...]:`
- `src-tauri/src/ghost/scan/directory.rs:63` `let dev_options_path = path.join("developer_options.txt");`
