# don't need bind,数値

- **規格**: [don-t-2.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/don-t-2.md)
- **検索語**: don't need bind
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `don't need bind` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:184` `// [don't need onmousemove,数値], [don't need bind,数値], [don't need seriko talk,数値`
- `src-tauri/src/ghost/scan/directory.rs:186` `let _need_bind = m.get("don't need bind");`
