# icon.rect,始点X,始点Y,終点X,終点Y

- **規格**: [icon.rect.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect/) (ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect.md)
- **検索語**: icon.rect
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「icon.rect」が見つからない。


## 実装箇所

- `crates/nanai-surface/src/parser/helpers/lines.rs:147` `} else if key_lower == "icon.rect" {`
- `ui/ts/surface/parser/index.ts:152` `// icon.rect,x1,y1,x2,y2`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:31` `icon.rect,10,20,30,40`
- `crates/nanai-surface/src/types/surface/definition.rs:22` `/// 顔サムネイル切り出し矩形（`icon.rect,始点X,始点Y,終点X,終点Y`）`
- `tests/parser-fuzzing/cycle10-syntax-fuzzing.test.ts:39` `icon.rect,5,5,25,25`
- `crates/nanai-surface/src/types/surface/definition.rs:31` `/// 明示指定（`icon.rect`）があればそれを長辺基準で正方形に整形して採用する。`
