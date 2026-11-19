# ghost/master/*.cur

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: ghost/master/*.cur
- **対応状況**: ❌ 未実装

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `*.cur`（ゴースト上にカーソルが乗った際に表示されるカーソルファイル）は未実装。バルーン側の `descript.txt` `mousecursor` プロパティを CSS `cursor` へ反映する経路（`ui/ts/core/actions/balloon-descript/assets.ts`）とは異なり、`ghost/master/` 配下の `*.cur` 読み込みやキャラクターホバー時のカーソル切替処理は実装されていない。

## 実装箇所

実装コード内に「ghost/master/*.cur」は検出されませんでした。
