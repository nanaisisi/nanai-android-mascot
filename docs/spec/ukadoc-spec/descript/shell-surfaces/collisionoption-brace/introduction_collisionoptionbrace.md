# collisionoptionブレス記述例

- **規格**: [introduction_collisionoptionbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/collisionoption-brace/introduction_collisionoptionbrace/) (ukadoc-spec/descript/shell-surfaces/collisionoption-brace/introduction_collisionoptionbrace.md)
- **検索語**: collisionoption
- **対応状況**: ✅ 実装済
- **保証レベル**: L3

## 突合結果

`crates/nanai-core/src/surfaces_parser/parser/core.rs` にて `<scope>.collisionoption` ブロックのパースを実装し、`tests/collision-option.test.ts` で動作検証済み。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser/parser/core.rs` `collisionoption` ブロック解析
- `ui/ts/surface/surface-collision.ts` `isNoDragCollision` / `isNoContextMenuCollision`
- `tests/collision-option.test.ts` スコープ別判定テスト
