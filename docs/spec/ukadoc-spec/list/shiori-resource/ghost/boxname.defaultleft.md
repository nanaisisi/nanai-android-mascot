# (入力ボックス種類).defaultleft　(入力ボックス種類).defaulttop

- **規格**: [boxname.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/boxname.defaultleft/) (ukadoc-spec/list/shiori-resource/ghost/boxname.defaultleft.md)
- **検索語**: .defaultleft
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「.defaultleft」を確認。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:95` `// [sakura.defaultleft,X座標], [sakura.defaulttop,Y座標], [sakura.defaultx,X座標], [sa`
- `src-tauri/src/ghost/scan/shell.rs:96` `// [kero.defaultleft,X座標], [kero.defaulttop,Y座標], [kero.defaultx,X座標], [kero.def`
- `src-tauri/src/ghost/scan/shell.rs:97` `// [char*.defaultleft,X座標], [char*.defaulttop,Y座標], [char*.defaultx,X座標], [char*`
- `crates/ui/src/descript/parser.rs:126` `.get(&format!("{target}.defaultleft"))`
- `crates/ui/src/descript/tests.rs:97` `sakura.defaultleft,10\n\`
