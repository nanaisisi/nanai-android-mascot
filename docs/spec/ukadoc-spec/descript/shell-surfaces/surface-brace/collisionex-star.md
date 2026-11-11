# collisionex\*,ID,タイプ,座標1,座標2...

- **規格**: [collisionex-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star.md)
- **検索語**: collisionex
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/ui/src/surfaces/parser/handlers/animation.rs:29` `} else if let Some(collision_part) = field_lower.strip_prefix("collisionex") {`
- `crates/ui/src/surfaces/parser/helpers/lines.rs:135` `if let Some(rest) = key_lower.strip_prefix("collisionex") {`
- `ui/ts/surface/parser/animation-collision.ts:71` `/^(?:animation)?(\d+)\.?collisionex(\d*),\s*(.+)$/i,`
- `ui/ts/surface/parser/collision.ts:33` `const idMatch = parts[0].match(/collisionex(\d+)/i);`
- `ui/ts/surface/parser/index.ts:169` `if (trimmed.startsWith("collisionex")) {`
