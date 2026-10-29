# don't need seriko talk,数値

- **規格**: [don-t-3.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/don-t-3/) (ukadoc-spec/descript/ghost/descript-txt/don-t-3.md)
- **検索語**: need
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「need」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/update/network.rs:126` `let mut needs_update = false;`
- `src-tauri/src/commands/update/network.rs:129` `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:133` `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:136` `needs_update = true;`
- `src-tauri/src/commands/update/network.rs:140` `if needs_update {`
