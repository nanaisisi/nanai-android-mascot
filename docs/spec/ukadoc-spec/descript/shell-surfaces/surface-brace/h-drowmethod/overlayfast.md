# overlayfast

- **規格**: [overlayfast.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlayfast/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlayfast.md)
- **検索語**: overlayfast
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::OverlayFast => "overlayfast".to_string(),`
- `crates/ui/src/surfaces/types/draw.rs:12` `/// `overlayfast`（`fast`）: 下の同一領域を消して重ねる`
- `crates/ui/src/surfaces/types/draw.rs:43` `"overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,`
- `crates/ui/src/surfaces/types/draw.rs:173` `assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);`
- `ui/js/surface/surface-load.js:120` `// [overlayfast]`
