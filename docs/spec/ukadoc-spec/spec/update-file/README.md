# update-file 項目別突合

規格 (ukadoc-spec/spec/update-file) の項目ごとの突合結果です。

| 項目                                       |  対応状況   | 備考                                        |
| :----------------------------------------- | :---------: | :------------------------------------------ |
| [概要](overview.md)                        | ✅ 実装済 | update/dau.rs、network.rs で更新処理完備    |
| [フィールド詳細](fields.md)                | ✅ 実装済 | 相対パス、MD5、ファイルサイズのパースに対応 |
| [生成処理](generation.md)                  |  ❌ 未実装  | クライアントアプリのため生成機能は対象外    |
| [パスの扱い](path-handling.md)             | ✅ 実装済 | パス区切り正規化等に対応                    |
| [updates2.dau (Version 2)](updates2dau.md) | ✅ 実装済 | dau.rs に処理あり                           |
| [updates.txt (Version 3)](updatestxt.md)   | ✅ 実装済 | dau.rs / network.rs に処理あり              |
