# SSPの基本情報

- **規格**: [about/ssp.md](https://ukatech.shillest.net/ukadoc-ssp/about/ssp/) (ukadoc-ssp/about/ssp.md)
- **対応状況**: ✅ 実装済

## 突合結果

クレジット、ライセンス表記、バージョン情報モーダル

## 実装箇所

- `src-tauri/src/commands/calendar.rs:1` `//! SSP Calendar & Schedule Manager specification implementation (ukadoc-ssp/fun`
- `src-tauri/src/shiori/fmo.rs:90` `/// ベースウェア動作宣言として "ssp" および "sakura" 名前つき Mutex を獲得・保持する`
- `src-tauri/src/shiori/fmo.rs:94` `if let Some(h) = win_mutex::acquire_mutex("ssp") {`
- `src-tauri/src/shiori/fmo.rs:102` `set_fallback_mutex("ssp", true);`
- `src-tauri/src/shiori/fmo.rs:104` `println!("🔒 BaseWare Named Mutexes ('ssp', 'sakura') successfully acquired and h`
