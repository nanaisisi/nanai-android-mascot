# overlay-fast

- **規格**: [overlay-fast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay-fast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay-fast.md)
- **検索語**: overlay-fast
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「overlay-fast」を確認。


## 実装箇所

- `crates/ui/src/surfaces/tests.rs:45` `assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);`
- `crates/ui/src/surfaces/types/draw.rs:35` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
