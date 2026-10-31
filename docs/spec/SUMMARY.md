# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ

各項目ファイルの「対応状況」を集計したものです。判定はソースの文字列検索と、一部の実装読解に基づきます。

| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript                 |       520 |          39 |         4 |         0 |  563 |
| ukadoc-spec/dev                      |         7 |           0 |         0 |         0 |    7 |
| ukadoc-spec/list                     |        82 |          21 |      1157 |         0 | 1260 |
| ukadoc-spec/manual                   |        48 |           0 |         0 |         0 |   48 |
| ukadoc-spec/memo                     |         3 |           0 |         0 |         0 |    3 |
| ukadoc-spec/spec                     |        40 |           5 |        70 |         0 |  115 |
| ukadoc-ssp/about                     |         5 |           0 |         0 |         0 |    5 |
| ukadoc-ssp/config                    |        10 |           5 |         2 |         0 |   17 |
| ukadoc-ssp/dev                       |         4 |           1 |         0 |         0 |    5 |
| ukadoc-ssp/extra-spec                |         3 |           0 |         0 |         0 |    3 |
| ukadoc-ssp/functions                 |        14 |           2 |         1 |         0 |   17 |
| ukadoc-ssp/howto                     |         6 |           1 |         0 |         0 |    7 |
| **合計** |       742 |          74 |      1234 |         0 | 2050 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
