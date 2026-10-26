# dll 項目別突合

規格 (ukadoc-spec/spec/dll.md) の見出し単位の突合結果です。実装コードの文字列検索による一次調査です。

| 項目                                |  対応状況   | 備考                                                                                                                  |
| :---------------------------------- | :---------: | :-------------------------------------------------------------------------------------------------------------------- |
| [DLL共通仕様](01.md)                | ⚠️ 一部対応 | SHIORI 用 DLL ロードは shiori/dynamic.rs (GlobalAlloc 利用) で実装。loadu は検出されず、SHIORI 以外への共通化は未確認 |
| [メモリ管理](02.md)                 | ⚠️ 一部対応 | SHIORI 用 DLL ロードは shiori/dynamic.rs (GlobalAlloc 利用) で実装。loadu は検出されず、SHIORI 以外への共通化は未確認 |
| [request関数](03.md)                | ⚠️ 一部対応 | SHIORI 用 DLL ロードは shiori/dynamic.rs (GlobalAlloc 利用) で実装。loadu は検出されず、SHIORI 以外への共通化は未確認 |
| [ライフサイクル関数 (loadu)](04.md) | ⚠️ 一部対応 | SHIORI 用 DLL ロードは shiori/dynamic.rs (GlobalAlloc 利用) で実装。loadu は検出されず、SHIORI 以外への共通化は未確認 |
