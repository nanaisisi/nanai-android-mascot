# nocontextmenu*,当たり判定名

- **規格**: [nocontextmenu-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/collisionoption-brace/nocontextmenu-star/) (ukadoc-spec/descript/shell-surfaces/collisionoption-brace/nocontextmenu-star.md)
- **検索語**: nocontextmenu
- **対応状況**: ✅ 実装済
- **保証レベル**: L3

## 突合結果

`crates/nanai-core/src/surfaces_parser/parser/core.rs` にて `nocontextmenu` 定義のパースを実装し、`ui/ts/surface/surface-collision.ts` の `isNoContextMenuCollision` および `tests/collision-option.test.ts` で検証済み。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/core.rs` `nocontextmenu` 解析
- `ui/ts/surface/surface-collision.ts` `isNoContextMenuCollision`
- `tests/collision-option.test.ts` `isNoContextMenuCollision` テスト
