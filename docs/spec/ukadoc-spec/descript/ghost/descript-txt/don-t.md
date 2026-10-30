# don't need onmousemove,数値

- **規格**: [don-t.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/don-t.md)
- **検索語**: don't need onmousemove
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `don't need onmousemove` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:184` `// [don't need onmousemove,数値], [don't need bind,数値], [don't need seriko talk,数値`
- `src-tauri/src/ghost/scan/directory.rs:185` `let _need_mousemove = m.get("don't need onmousemove");`
