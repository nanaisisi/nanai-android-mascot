# update-file 項目別突合

規格 (ukadoc-spec/spec/update-file) の項目ごとの突合結果です。実装コードの文字列検索による一次調査です。

| 項目                                       |  対応状況   | 備考                                     |
| :----------------------------------------- | :---------: | :--------------------------------------- |
| [概要](overview.md)                        | ⚠️ 一部対応 | update/dau.rs、network.rs で更新処理あり |
| [フィールド詳細](fields.md)                | ⚠️ 一部対応 | 相対パス、MD5、ファイルサイズのパースに対応 |
| [生成処理](generation.md)                  |  ❌ 未実装  | 更新定義ファイルの生成機能は未実装       |
| [パスの扱い](path-handling.md)             | ⚠️ 一部対応 | パス区切り正規化等に対応                  |
| [updates2.dau (Version 2)](updates2dau.md) | ⚠️ 一部対応 | dau.rs に処理あり                        |
| [updates.txt (Version 3)](updatestxt.md)   | ⚠️ 一部対応 | dau.rs / network.rs に処理あり           |
