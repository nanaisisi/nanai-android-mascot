# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.md)
- **検索語**: cursor, mousecursor
- **対応状況**: ❌ 未実装

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.arrow`, `mousecursor.text`, `mousecursor.wait`（および `cursor`）を検出し、Tauriセキュアパス変換を経て CSS カスタムプロパティ `--balloon-cursor-arrow`, `--balloon-cursor-text`, `--balloon-cursor-wait` へ設定する実装が行われている。

## 実装箇所

実装コード内に「cursor, mousecursor」は検出されませんでした。
