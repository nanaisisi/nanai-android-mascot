# 使用上の注意

- **規格**: [streamingtool.md](../../../../ukadoc-ssp/config/streamingtool.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/streamingtool/))
- **検索語**: streamingtool, notes
- **対応状況**: ⚠️ 一部対応

## 突合結果

配信機能の使用上の注意に対応する機能は未実装。


## 実装箇所

- `crates/nanai-vfs/src/tests/traits_and_overlay/vfs_traits.rs:40` `mock.write_text_file("notes/todo.txt", "line1\n");`
- `src-tauri/src/commands/install/archive/packaging.rs:252` `"./secret_dir,nonar,noupdate\nnonar=draft.txt\nnonar:\\ghost\\master\\notes.txt\`
- `crates/nanai-vfs/src/tests/traits_and_overlay/vfs_traits.rs:41` `mock.append_file("notes/todo.txt", b"line2\n");`
- `src-tauri/src/commands/install/archive/packaging.rs:264` `source_dir.join("ghost").join("master").join("notes.txt"),`
- `crates/nanai-vfs/src/tests/traits_and_overlay/vfs_traits.rs:42` `assert_eq!(mock.read_text("notes/todo.txt").unwrap(), "line1\nline2\n");`
- `src-tauri/src/commands/install/archive/packaging.rs:278` `assert!(zip.by_name("ghost/master/notes.txt").is_err());`
