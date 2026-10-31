# 相対パス

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/entry/) (ukadoc-spec/descript/install/delete.txt/entry.md)
- **検索語**: 相対パス
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `delete.txt` 内の相対パス行を 1 行ずつ読み込み、対象ディレクトリ・ファイルを安全に自動削除する実装が行われている。

## 実装箇所

- `crates/ui/src/update.rs:44` `// [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readon`
- `crates/ui/src/surfaces/types/surface.rs:14` `/// 描画する画像ファイル（シェル相対パス）`
- `ui/js/core/tauri-helper.js:95` `// 相対パスまたはWeb URLはそのまま`
- `cpp/yaya-shiori/basis.cpp:301` `*  機能概要：  渡された文字列が相対パス表記なら絶対パスに書き換えます`
