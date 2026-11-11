# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay.md)
- **検索語**: overlay
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::Overlay => "overlay".to_string(),`
- `src-tauri/src/common/vfs.rs:55` `let mut overlay = OverlayVfs::new();`
- `src-tauri/src/common/vfs.rs:56` `overlay.push_base(Arc::new(mock.clone()));`
- `src-tauri/src/common/vfs.rs:57` `assert_eq!(overlay.layer_count(), 1);`
- `src-tauri/src/common/vfs.rs:58` `assert!(overlay.is_file("shell/master/surface0000.png"));`
