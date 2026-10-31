# 補足

- **規格**: [note-1.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/note-1/) (ukadoc-spec/list/sakura-script/balloon-text/note-1.md)
- **検索語**: 補足
- **対応状況**: ✅ 実装済

## 突合結果

`\_b` タグ等のファイルパスやオプションに関する解説補足ページ。実装対象のコマンドではなく仕様解説文書。


## 実装箇所

- `crates/ui/src/update.rs:44` `// [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readon`
- `cpp/yaya-shiori/wsex.cpp:232` `*  補足　wchar_t*を直接渡せる_wfopenはWin9x系未サポートのため使えないのです。無念。`
