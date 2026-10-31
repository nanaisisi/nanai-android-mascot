# delete.txt

- **規格**: [introduction_delete.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/introduction_delete.txt/) (ukadoc-spec/descript/install/delete.txt/introduction_delete.txt.md)
- **検索語**: delete.txt
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `delete.txt` のパースおよび更新・抽出時削除処理を行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:5` `let delete_txt_path = target_dir.join("delete.txt");`
