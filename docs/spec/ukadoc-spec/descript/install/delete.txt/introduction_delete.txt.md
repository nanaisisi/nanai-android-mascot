# delete.txt

- **規格**: [introduction_delete.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/introduction_delete.txt/) (ukadoc-spec/descript/install/delete.txt/introduction_delete.txt.md)
- **検索語**: delete.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `delete.txt` のパースおよび更新・抽出時削除処理を行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:56` `let delete_txt_path = target_dir.join("delete.txt");`
- `src-tauri/src/commands/update/network/commands.rs:247` `// 更新後に delete.txt が存在する場合、旧ファイルのクリーンアップ処理を実行`
