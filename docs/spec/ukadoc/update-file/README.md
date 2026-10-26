# update-file 項目別突合

規格 (ukadoc-spec/spec/update-file) の項目ごとの突合結果です。実装コードの文字列検索による一次調査です。

| 項目                                       |  対応状況   | 備考                                     |
| :----------------------------------------- | :---------: | :--------------------------------------- |
| [概要](overview.md)                        | ⚠️ 一部対応 | update/dau.rs、network.rs で更新処理あり |
| [フィールド詳細](fields.md)                |  ❓ 未確認  | dau.rs のフィールド網羅性は要確認        |
| [生成処理](generation.md)                  |  ❓ 未確認  | 更新定義ファイルの生成機能の有無を要確認 |
| [パスの扱い](path-handling.md)             |  ❓ 未確認  | 要確認                                   |
| [updates2.dau (Version 2)](updates2dau.md) | ⚠️ 一部対応 | dau.rs に処理あり                        |
| [updates.txt (Version 3)](updatestxt.md)   | ⚠️ 一部対応 | dau.rs / network.rs に処理あり           |
