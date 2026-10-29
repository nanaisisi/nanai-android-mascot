# \m[umsg,wparam,lparam]

- **規格**: [m-umsg-wparam-lparam.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam/) (ukadoc-spec/list/sakura-script/misc/m-umsg-wparam-lparam.md)
- **検索語**: \m
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\m」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/update.rs:73` `let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x`
- `crates/ui/src/update.rs:74` `ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";`
- `crates/ui/src/update.rs:91` `file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890\r\n";`
