# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ

各項目ファイルの公式仕様に対する実装状況の自動集計結果です。

| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript                 |       232 |         260 |        71 |         0 |  563 |
| ukadoc-spec/dev                      |         1 |           5 |         1 |         0 |    7 |
| ukadoc-spec/list                     |       338 |         646 |       275 |         1 | 1260 |
| ukadoc-spec/manual                   |        35 |           0 |        31 |         0 |   66 |
| ukadoc-spec/memo                     |         2 |           0 |         1 |         0 |    3 |
| ukadoc-spec/spec                     |        21 |          39 |        55 |         0 |  115 |
| ukadoc-ssp/about                     |         1 |           2 |         2 |         0 |    5 |
| ukadoc-ssp/config                    |         4 |           6 |         7 |         0 |   17 |
| ukadoc-ssp/dev                       |         1 |           0 |         4 |         0 |    5 |
| ukadoc-ssp/functions                 |         4 |          11 |         2 |         0 |   17 |
| ukadoc-ssp/howto                     |         2 |           3 |         2 |         0 |    7 |
| **合計** |       641 |         972 |       451 |         1 | 2065 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
