# sstp.alwaystranslate,数値

- **規格**: [sstp.alwaystranslate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.alwaystranslate.md)
- **検索語**: sstp.alwaystranslate
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/sstp/config.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `sstp.alwaystranslate` ディレクティブのパースおよび OnTranslate 強制適用判定が完全実装済み。

## 実装箇所

- `crates/ui/src/sstp/config/ghost_config.rs:9` `/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:156` `.and_then(|m| m.get("sstp.alwaystranslate"))`
- `crates/ui/src/sstp/config/ghost_config.rs:18` `/// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0`
- `crates/ui/src/sstp/config/ghost_config.rs:72` `.get("sstp.alwaystranslate")`
- `crates/ui/src/sstp/config/ghost_config.rs:107` `/// [sstp.alwaystranslate]: notranslate オプション指定を上書きして翻訳を強制するか判定`
- `crates/ui/src/sstp/tests/execution/command_context/ghost_config.rs:12` `map.insert("sstp.alwaystranslate".to_string(), "1".to_string());`
