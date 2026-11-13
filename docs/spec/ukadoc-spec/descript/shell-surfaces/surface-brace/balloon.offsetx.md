# balloon.offsetx,座標

- **規格**: [balloon.offsetx.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/balloon.offsetx/) (ukadoc-spec/descript/shell-surfaces/surface-brace/balloon.offsetx.md)
- **検索語**: balloon.offsetx
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「balloon.offsetx」が見つからない。

## 実装箇所

- `crates/nanai-surface/src/parser/handlers/utils.rs:74` `// balloon.offsetx, balloon.offsety, balloon.offset.x, balloon.offset.y`
- `ui/ts/core/actions/balloon-descript/layout/alignment.ts:86` `// [sakura.balloon.offsetx,座標], [sakura.balloon.offsety,座標], [kero.balloon.offse`
- `tests/balloon-cycle9-robustness.test.ts:137` `"char2.balloon.offsetx": "55",`
- `crates/nanai-surface/src/parser/handlers/utils.rs:81` `// sakura.balloon.offsetx / kero.balloon.offsetx / sakura.balloon.offset.x 等`
- `ui/ts/core/actions/balloon-descript/layout/alignment.ts:89` `(scopeId === 0 ? props["sakura.balloon.offsetx"] : null) ||`
- `tests/surface-facades.test.ts:61` `surfaceParser.handleBalloonOffset("balloon.offsetx,15", ["0"], offsets);`
