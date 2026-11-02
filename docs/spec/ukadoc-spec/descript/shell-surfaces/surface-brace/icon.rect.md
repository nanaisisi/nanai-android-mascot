# icon.rect,始点X,始点Y,終点X,終点Y

- **規格**: [icon.rect.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect/) (ukadoc-spec/descript/shell-surfaces/surface-brace/icon.rect.md)
- **検索語**: icon.rect
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「icon.rect」が見つからない。


## 実装箇所

- `crates/ui/src/surfaces/parser/mod.rs:197` `} else if key_lower == "icon.rect" {`
- `crates/ui/src/surfaces/types/surface.rs:85` `/// 顔サムネイル切り出し矩形（`icon.rect,始点X,始点Y,終点X,終点Y`）`
- `crates/ui/src/surfaces/types/surface.rs:94` `/// 明示指定（`icon.rect`）があればそれを長辺基準で正方形に整形して採用する。`
