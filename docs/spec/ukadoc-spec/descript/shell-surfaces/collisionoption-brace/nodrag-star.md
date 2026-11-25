# nodrag*,当たり判定名

- **規格**: [nodrag-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/collisionoption-brace/nodrag-star/) (ukadoc-spec/descript/shell-surfaces/collisionoption-brace/nodrag-star.md)
- **検索語**: nodrag
- **対応状況**: ✅ 実装済
- **保証レベル**: L3

## 突合結果

`crates/nanai-core/src/surfaces_parser/parser/core.rs` にて `nodrag` 定義のパースを実装し、`ui/ts/surface/surface-collision.ts` の `isNoDragCollision` および `tests/collision-option.test.ts` で検証済み。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/core.rs` `nodrag` 解析
- `ui/ts/surface/surface-collision.ts` `isNoDragCollision`
- `tests/collision-option.test.ts` `isNoDragCollision` テスト
