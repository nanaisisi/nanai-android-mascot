# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ

各項目ファイルの公式仕様に対する実装状況の自動集計結果です。

| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript                 |       349 |         143 |        71 |         0 |  563 |
| ukadoc-spec/dev                      |         5 |           1 |         1 |         0 |    7 |
| ukadoc-spec/list                     |       575 |         410 |       274 |         1 | 1260 |
| ukadoc-spec/manual                   |        35 |           0 |        31 |         0 |   66 |
| ukadoc-spec/memo                     |         2 |           0 |         1 |         0 |    3 |
| ukadoc-spec/spec                     |        36 |          24 |        55 |         0 |  115 |
| ukadoc-ssp/about                     |         3 |           0 |         2 |         0 |    5 |
| ukadoc-ssp/config                    |         6 |           4 |         7 |         0 |   17 |
| ukadoc-ssp/dev                       |         1 |           0 |         4 |         0 |    5 |
| ukadoc-ssp/functions                 |        10 |           5 |         2 |         0 |   17 |
| ukadoc-ssp/howto                     |         5 |           0 |         2 |         0 |    7 |
| **合計** |      1027 |         587 |       450 |         1 | 2065 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
