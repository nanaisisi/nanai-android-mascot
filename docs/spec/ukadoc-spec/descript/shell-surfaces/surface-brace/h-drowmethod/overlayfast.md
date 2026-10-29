# overlayfast

- **規格**: [overlayfast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlayfast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlayfast.md)
- **検索語**: overlayfast
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「overlayfast」を確認。


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::OverlayFast => "overlayfast".to_string(),`
- `crates/ui/src/surfaces/tests.rs:43` `assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);`
- `crates/ui/src/surfaces/tests.rs:334` `animation1.pattern,overlayfast,-1,40,0,0`
- `crates/ui/src/surfaces/types/draw.rs:12` `/// `overlayfast`（`fast`）: 下の同一領域を消して重ねる`
- `crates/ui/src/surfaces/types/draw.rs:35` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
