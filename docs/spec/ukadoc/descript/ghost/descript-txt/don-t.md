# don't need onmousemove,数値

- **規格**: [don-t.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/don-t/) (ukadoc-spec/descript/ghost/descript-txt/don-t.md)
- **検索語**: need
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「need」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/update/network.rs:85`  `let mut needs_update = false;`
- `src-tauri/src/commands/update/network.rs:88`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:92`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:95`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:99`  `if needs_update {`
