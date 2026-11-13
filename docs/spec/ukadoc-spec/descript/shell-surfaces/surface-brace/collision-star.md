# collision\*,始点X,始点Y,終点X,終点Y,ID

- **規格**: [collision-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star.md)
- **検索語**: collision
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:88` `if k_norm == "collision-sort" || k_norm == "collision.sort" {`
- `ui/ts/surface/surface-collision.ts:260` `const entryKey = `${entry.event.toLowerCase()}\0${entry.collision.toLowerCase()}`
- `ui/ts/ui/spec-compliance-runner.ts:12` `import { surfaceCollisionMethods } from "../surface/surface-collision.js";`
- `tests/shell-manifest.test.ts:15` `test("shell-manifest functions cover enums, collision records, and containment",`
- `crates/nanai-core/src/surfaces_parser.rs:124` `if trimmed.to_ascii_lowercase().starts_with("collision") {`
- `ui/ts/surface/surface-render.ts:7` `import { surfaceCollisionMethods } from "./surface-collision.js";`
