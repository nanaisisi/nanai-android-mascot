# 相対パス

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/entry/) (ukadoc-spec/descript/install/delete.txt/entry.md)
- **検索語**: 相対パス
- **対応状況**: 📝 コメントのみ(未実装の可能性大)

## 突合結果

実装コードに「相対パス」が出現。実際の処理内容は未精査。

## 実装箇所

- `crates/ui/src/surfaces/types/surface.rs:14` `/// 描画する画像ファイル（シェル相対パス）`
- `ui/js/core/tauri-helper.js:95` `// 相対パスまたはWeb URLはそのまま`
- `cpp/yaya-shiori/basis.cpp:301` `*  機能概要：  渡された文字列が相対パス表記なら絶対パスに書き換えます`
