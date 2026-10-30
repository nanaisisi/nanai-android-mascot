# UKADOC Spec & SSP 標準仕様 実装突合マスタサマリ

本ドキュメントは、公式 **ukadoc-spec** と標準環境 **ukadoc-ssp** の双方における Nanai Android Mascot の実装対応状況をプレフィックス付きで網羅的に集計したマスターサマリである。

| 規格カテゴリ (ukadoc-spec / ukadoc-ssp) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :-------------------------------------- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript                    |       520 |          39 |         4 |         0 |  563 |
| ukadoc-spec/dev                         |         7 |           0 |         0 |         0 |    7 |
| ukadoc-spec/list                        |        82 |          21 |      1157 |         0 | 1260 |
| ukadoc-spec/manual                      |         8 |           7 |         7 |         0 |   22 |
| ukadoc-spec/memo                        |         3 |           0 |         0 |         0 |    3 |
| ukadoc-spec/spec                        |        40 |           5 |        70 |         0 |  115 |
| ukadoc-ssp/about                        |         5 |           0 |         0 |         0 |    5 |
| ukadoc-ssp/config                       |        10 |           5 |         2 |         0 |   17 |
| ukadoc-ssp/dev                          |         4 |           1 |         0 |         0 |    5 |
| ukadoc-ssp/extra-spec                   |         3 |           0 |         0 |         0 |    3 |
| ukadoc-ssp/functions                    |        14 |           2 |         1 |         0 |   17 |
| ukadoc-ssp/howto                        |         6 |           1 |         0 |         0 |    7 |
| **合計**                                |       702 |          81 |      1241 |         0 | 2024 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
