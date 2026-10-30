# headline 項目別突合

規格 (ukadoc-spec/spec/headline.md) の見出し単位の突合結果です。実装コードおよび `headline-compliance.md` に対応が完了しています。

| 項目 | 対応状況 | 備考 |
| :--- | :---: | :--- |
| [前書](01.md) | ✅ 対応済 (headline-compliance.md) | HEADLINE/2.0 の仕様概要および Nanai 設計方針定義済 |
| [ヘッドラインの実体](02.md) | ✅ 対応済 (headline-compliance.md) | ヘッドライン設定 (`descript.txt`) との結合設計反映済 |
| [DLL](03.md) | ✅ 対応済 (src-tauri/src/shiori/) | 共通 DLL/WebSensor 拡張基盤を利用 |
| [request-response 1: version取得](04.md) | ✅ 対応済 (headline-compliance.md) | プロトコルネゴシエーション仕様反映済 |
| [request-response 2: ヘッドライン取得](05.md) | ✅ 対応済 (headline-compliance.md) | フィード取得および `OnHeadline` イベント通知パイプライン設計済 |
| [descript.txt](06.md) | ✅ 対応済 (src-tauri/src/commands/ext.rs) | `scan_headlines` による `descript.txt` スキャン実装済 |
| [SHIORI Event](07.md) | ✅ 対応済 (src-tauri/src/shiori/) | `OnHeadlinesense*` イベント対応済 |
| [補足](08.md) | ✅ 対応済 (headline-compliance.md) | 仕様補足事項確認済 |
