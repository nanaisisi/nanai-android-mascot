# SAORI/1.0の概要

- **規格**: [saori.md](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/saori/)
- **検索語**: SAORI
- **対応状況**: ⚠️ 一部対応

## 突合結果

ヒットしたのは一般的な語「SAORI」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/shiori/saori.rs:79` `"🔌 EXECUTE SAORI/1.0: dll={:?}, args={:?}",`
- `src-tauri/src/shiori/saori.rs:100` `let mut req_text = String::from("EXECUTE SAORI/1.0\r\nCharset: UTF-8\r\n");`
- `src-tauri/src/shiori/saori.rs:140` `"Nanai SAORI Stub: executed successfully with {} args",`
- `src-tauri/src/shiori/saori.rs:148` `headers.insert("Sender".to_string(), "Nanai-SAORI-Host".to_string());`
- `crates/ui/src/sstp/message/request/core.rs:110` `self.module.is_some() || self.version.to_uppercase().contains("SAORI")`
