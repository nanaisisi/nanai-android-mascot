# OnSSTPBlacklisting

- **規格**: [OnSSTPBlacklisting.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/sstp/OnSSTPBlacklisting/) (ukadoc-spec/list/shiori-event/sstp/OnSSTPBlacklisting.md)
- **検索語**: OnSSTPBlacklisting
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnSSTPBlacklisting」が見つからない。


## 実装箇所

- `src-tauri/src/sstp.rs:162` `/// SSTP ブラックリスト登録発生時の通知ペイロード (UKADOC OnSSTPBlacklisting 規格準拠)`
- `src-tauri/src/sstp.rs:182` `/// クライアントのブラックリスト登録を通知し OnSSTPBlacklisting イベントペイロードを構築する`
- `src-tauri/src/sstp.rs:404` `assert_eq!(bl_params.get("ID"), Some(&"OnSSTPBlacklisting".to_string()));`
- `crates/ui/src/sstp/mod.rs:601` `/// SSTP イベント（SHIORI イベント OnSSTPBreak, OnSSTPBlacklisting 等）生成ビルダー`
- `crates/ui/src/sstp/mod.rs:622` `/// OnSSTPBlacklisting イベントリクエストのパラメータを構築`
