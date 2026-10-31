# ukadoc-spec & ukadoc-ssp 規格別 実装突合サマリ

本ドキュメントは、公式 **ukadoc-spec** と標準環境 **ukadoc-ssp** の双方における Nanai Android Mascot の対応状況を網羅的に集計したマスターサマリである。

| 規格カテゴリ (ukadoc-spec / ukadoc-ssp) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| ukadoc-spec/descript/balloon         |       165 |           4 |         2 |         0 |  171 |
| ukadoc-spec/descript/ghost           |        77 |           0 |         0 |         0 |   77 |
| ukadoc-spec/descript/headline        |        14 |           0 |         0 |         0 |   14 |
| ukadoc-spec/descript/install         |        22 |           0 |         0 |         0 |   22 |
| ukadoc-spec/descript/plugin          |        14 |           0 |         0 |         0 |   14 |
| ukadoc-spec/descript/shell           |        95 |           9 |         0 |         0 |  104 |
| ukadoc-spec/descript/shell-surfaces  |       126 |          26 |         2 |         0 |  154 |
| ukadoc-spec/descript/shell-surfacetable |         7 |           0 |         0 |         0 |    7 |
| ukadoc-spec/dev                      |         7 |           0 |         0 |         0 |    7 |
| ukadoc-spec/list/plugin-event        |         5 |           0 |        14 |         0 |   19 |
| ukadoc-spec/list/propertysystem      |         2 |           1 |       194 |         0 |  197 |
| ukadoc-spec/list/sakura-script       |        31 |          10 |       334 |         0 |  375 |
| ukadoc-spec/list/shiori-event        |        41 |           4 |       284 |         0 |  329 |
| ukadoc-spec/list/shiori-event-ex     |         0 |           0 |       178 |         0 |  178 |
| ukadoc-spec/list/shiori-resource     |         3 |           6 |       153 |         0 |  162 |
| ukadoc-spec/manual                   |         8 |           0 |         0 |         0 |    8 |
| ukadoc-spec/manual/balloon           |         0 |           7 |         7 |         0 |   14 |
| ukadoc-spec/memo                     |         3 |           0 |         0 |         0 |    3 |
| ukadoc-spec/spec/dll                 |         4 |           0 |         0 |         0 |    4 |
| ukadoc-spec/spec/fmo-mutex           |         0 |           0 |         3 |         0 |    3 |
| ukadoc-spec/spec/headline            |         8 |           0 |         0 |         0 |    8 |
| ukadoc-spec/spec/plugin              |         0 |           0 |        12 |         0 |   12 |
| ukadoc-spec/spec/saori-ex            |         2 |           0 |        41 |         0 |   43 |
| ukadoc-spec/spec/shiori3             |        26 |           0 |         1 |         0 |   27 |
| ukadoc-spec/spec/sstp                |         0 |           0 |        10 |         0 |   10 |
| ukadoc-spec/spec/update-file         |         0 |           5 |         1 |         0 |    6 |
| ukadoc-spec/spec/web                 |         0 |           0 |         2 |         0 |    2 |
| ukadoc-ssp/about                     |         5 |           0 |         0 |         0 |    5 |
| ukadoc-ssp/config                    |        10 |           5 |         2 |         0 |   17 |
| ukadoc-ssp/dev                       |         4 |           1 |         0 |         0 |    5 |
| ukadoc-ssp/extra-spec                |         3 |           0 |         0 |         0 |    3 |
| ukadoc-ssp/functions                 |         6 |           2 |         1 |         0 |    9 |
| ukadoc-ssp/functions/calendar        |         3 |           0 |         0 |         0 |    3 |
| ukadoc-ssp/functions/explorer        |         2 |           0 |         0 |         0 |    2 |
| ukadoc-ssp/functions/sspim           |         3 |           0 |         0 |         0 |    3 |
| ukadoc-ssp/howto                     |         6 |           1 |         0 |         0 |    7 |
| **合計** |       702 |          81 |      1241 |         0 | 2024 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
