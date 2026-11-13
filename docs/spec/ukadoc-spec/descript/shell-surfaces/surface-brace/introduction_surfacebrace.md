# surfaceブレス記述例

- **規格**: [introduction_surfacebrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace.md)
- **検索語**: surface
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `crates/nanai-core/src/surfaces_parser.rs:22` `if !lower.starts_with("surface") {`
- `src-tauri/src/commands/file.rs:50` `"🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_pa`
- `ui/main.ts:23` `import { InteractionManager } from "./ts/surface/interaction.js";`
- `ui/character.html:8` `<script type="module" src="ts/surface/character.ts"></script>`
- `tests/balloon-drag.test.ts:49` `const { BalloonDragManager } = await import("../ui/ts/surface/balloon-drag.js");`
- `crates/nanai-core/src/surfaces_parser.rs:26` `let rest = if lower.starts_with("surface.append") {`
