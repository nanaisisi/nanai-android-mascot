# サムネイル画像を設定する

- **規格**: [shell.md](../../../../ukadoc-spec/dev/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/shell/))
- **検索語**: thumbnail.png
- **対応状況**: ⚠️ 一部対応

## 突合結果

シェルのサムネイル画像表示に対応。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:156` `("thumbnail.png", "image/png"),`
- `src-tauri/src/commands/shell/balloon.rs:815` `std::fs::write(d.join("thumbnail.png"), [1u8, 2, 3]).unwrap();`
- `src-tauri/src/commands/shell/ghost.rs:245` `std::fs::write(master.join("thumbnail.png"), b"png").unwrap();`
- `src-tauri/src/commands/shell/ghost.rs:256` `resolve_ghost_thumbnail_from_dir(&dir).is_some_and(|p| p.ends_with("thumbnail.pn`
- `src-tauri/src/commands/shell/manifest.rs:184` `/// shell/<name>/thumbnail.png を探索してパスを返す。`
