# collision\*,始点X,始点Y,終点X,終点Y,ID

- **規格**: [collision-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star.md)
- **検索語**: collision
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/ui/src/surfaces/parser/handlers/animation.rs:3` `use super::collision::{parse_collision_area, parse_collisionex_area};`
- `crates/ui/src/surfaces/parser/handlers/animation.rs:33` `} else if let Some(collision_part) = field_lower.strip_prefix("collision") {`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:4` `pub mod collision;`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:10` `pub(crate) use collision::{apply_collision, apply_collisionex};`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:73` `apply_collision(&mut txt, &[0], "collision", "1,0,0,50,50,Head");`
