# sstp.alwaystranslate,数値

- **規格**: [sstp.alwaystranslate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.alwaystranslate.md)
- **検索語**: sstp.alwaystranslate
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.alwaystranslate` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:178` `// [sstp.allowcommunicate,数値], [sstp.allowunspecifiedsend,数値], [sstp.alwaystrans`
- `src-tauri/src/ghost/scan/directory.rs:181` `let _sstp_trans = m.get("sstp.alwaystranslate");`
