# sstp.alwaystranslate,数値

- **規格**: [sstp.alwaystranslate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.alwaystranslate.md)
- **検索語**: sstp.alwaystranslate
- **対応状況**: ✅ 実装済

## 突合結果

`crates/ui/src/sstp/config.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `sstp.alwaystranslate` ディレクティブのパースおよび OnTranslate 強制適用判定が完全実装済み。

## 実装箇所

- `crates/ui/src/sstp/config.rs` (`sstp.alwaystranslate`)
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`sstp.alwaystranslate`)
