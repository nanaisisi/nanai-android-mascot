# sstp.alwaystranslate,数値

- **規格**: [sstp.alwaystranslate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.alwaystranslate.md)
- **検索語**: sstp.alwaystranslate
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.alwaystranslate` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:90` `.and_then(|m| m.get("sstp.alwaystranslate"))`
- `crates/ui/src/sstp/mod.rs:507` `/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]`
- `crates/ui/src/sstp/mod.rs:516` `/// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0`
- `crates/ui/src/sstp/mod.rs:557` `.get("sstp.alwaystranslate")`
- `crates/ui/src/sstp/mod.rs:591` `/// [sstp.alwaystranslate]: notranslate オプション指定を上書きして翻訳を強制するか判定`
