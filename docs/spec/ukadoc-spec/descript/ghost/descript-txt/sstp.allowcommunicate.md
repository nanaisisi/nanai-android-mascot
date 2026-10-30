# sstp.allowcommunicate,数値

- **規格**: [sstp.allowcommunicate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowcommunicate.md)
- **検索語**: sstp.allowcommunicate
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.allowcommunicate` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:190` `// [sstp.allowcommunicate,数値], [sstp.allowunspecifiedsend,数値], [sstp.alwaystrans`
- `src-tauri/src/ghost/scan/directory.rs:191` `let _sstp_comm = m.get("sstp.allowcommunicate");`
