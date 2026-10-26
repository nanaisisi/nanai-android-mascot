# don't need onmousemove,数値

- **規格**: [don-t.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/don-t/) (ukadoc-spec/descript/ghost/descript-txt/don-t.md)
- **検索語**: need
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「need」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/update/network.rs:85`  `let mut needs_update = false;`
- `src-tauri/src/commands/update/network.rs:88`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:92`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:95`  `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:99`  `if needs_update {`
