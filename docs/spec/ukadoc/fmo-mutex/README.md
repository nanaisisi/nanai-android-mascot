# fmo-mutex 項目別突合

規格 (ukadoc-spec/spec/fmo-mutex) の項目ごとの突合結果です。実装コードの文字列検索による一次調査です。

| 項目 | 対応状況 | 備考 |
| :--- | :---: | :--- |
| [FMO (File Mapping Object)](fmo.md) | ❌ 未実装 | FMO の作成・参照なし (Mutex の検索ヒットは Rust 標準の排他制御であり無関係) |
| [Mutex](mutex.md) | ❌ 未実装 | ベースウェア識別用の名前付き Mutex なし |
| [FMO用Mutex](fmo-mutex.md) | ❌ 未実装 | FMO 未対応 |
