# icon.rect,始点X,始点Y,終点X,終点Y

- **規格**: [icon.rect.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect/) (ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect.md)
- **検索語**: icon.rect
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「icon.rect」が見つからない。


## 実装箇所

- `crates/ui/src/surfaces/parser/helpers/lines.rs:147` `} else if key_lower == "icon.rect" {`
- `crates/ui/src/surfaces/tests/collision_tests.rs:141` `icon.rect,10,20,70,80`
- `crates/ui/src/surfaces/tests/collision_tests.rs:221` `icon.rect,10,20,60,40`
- `crates/ui/src/surfaces/tests/collision_tests.rs:237` `// icon.rect: width = 50, height = 20 -> max side is 50.`
- `crates/ui/src/surfaces/tests/collision_tests.rs:243` `// s1 has no icon.rect, but has a "head" collision [20, 10, 60, 70]`
