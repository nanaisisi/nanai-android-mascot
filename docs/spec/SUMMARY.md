# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ

各項目ファイルの公式仕様に対する実装状況の自動集計結果です。

| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript                 |       272 |           3 |       288 |         0 |  563 |
| ukadoc-spec/dev                      |         5 |           0 |         2 |         0 |    7 |
| ukadoc-spec/list                     |       516 |           0 |       744 |         0 | 1260 |
| ukadoc-spec/manual                   |        22 |           0 |        44 |         0 |   66 |
| ukadoc-spec/memo                     |         2 |           0 |         1 |         0 |    3 |
| ukadoc-spec/spec                     |        45 |           0 |        70 |         0 |  115 |
| ukadoc-ssp/about                     |         3 |           0 |         2 |         0 |    5 |
| ukadoc-ssp/config                    |        10 |           0 |         7 |         0 |   17 |
| ukadoc-ssp/dev                       |         2 |           0 |         3 |         0 |    5 |
| ukadoc-ssp/extra-spec                |         1 |           0 |         2 |         0 |    3 |
| ukadoc-ssp/functions                 |        13 |           0 |         4 |         0 |   17 |
| ukadoc-ssp/howto                     |         5 |           0 |         2 |         0 |    7 |
| **合計** |       896 |           3 |      1169 |         0 | 2068 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
