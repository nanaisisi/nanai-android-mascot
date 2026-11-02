# OnSSTPBreak

- **規格**: [OnSSTPBreak.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/sstp/OnSSTPBreak/) (ukadoc-spec/list/shiori-event/sstp/OnSSTPBreak.md)
- **検索語**: OnSSTPBreak
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnSSTPBreak」が見つからない。


## 実装箇所

- `src-tauri/src/sstp.rs:154` `/// SSTP ブレイク発生時の通知ペイロード (UKADOC OnSSTPBreak 規格準拠)`
- `src-tauri/src/sstp.rs:168` `/// SSTP 中断 (Break) を通知し OnSSTPBreak イベントペイロードを構築する`
- `src-tauri/src/sstp.rs:398` `assert_eq!(params.get("ID"), Some(&"OnSSTPBreak".to_string()));`
- `crates/ui/src/sstp/mod.rs:601` `/// SSTP イベント（SHIORI イベント OnSSTPBreak, OnSSTPBlacklisting 等）生成ビルダー`
- `crates/ui/src/sstp/mod.rs:605` `/// OnSSTPBreak イベントリクエストのパラメータを構築`
