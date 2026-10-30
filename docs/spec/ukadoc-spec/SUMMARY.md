# UKADOC Spec & SSP 標準仕様 実装突合マスタサマリ

本ドキュメントは、公式 **ukadoc-spec**（コア仕様・スクリプト・イベント・記述子）と、事実上の標準ベースウェアである **ukadoc-ssp**（SSP標準設定・機能・ハウツー）の両方における Nanai Android Mascot の対応状況を網羅的に対照・集約したマスターサマリである。

| 規格カテゴリ | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| descript/balloon           |       165 |           4 |         2 |         0 |  171 |
| descript/ghost             |        77 |           0 |         0 |         0 |   77 |
| descript/headline          |        14 |           0 |         0 |         0 |   14 |
| descript/install           |        22 |           0 |         0 |         0 |   22 |
| descript/plugin            |        14 |           0 |         0 |         0 |   14 |
| descript/shell             |        95 |           9 |         0 |         0 |  104 |
| descript/shell-surfaces    |       126 |          26 |         2 |         0 |  154 |
| descript/shell-surfacetable |         7 |           0 |         0 |         0 |    7 |
| dev                        |         7 |           0 |         0 |         0 |    7 |
| list/plugin-event          |         4 |           0 |        14 |         1 |   19 |
| list/propertysystem        |         2 |           1 |       193 |         1 |  197 |
| list/sakura-script         |        31 |          10 |       334 |         0 |  375 |
| list/shiori-event          |        41 |           4 |       284 |         0 |  329 |
| list/shiori-event-ex       |         0 |           0 |       178 |         0 |  178 |
| list/shiori-resource       |         3 |           6 |       152 |         1 |  162 |
| manual                     |         8 |           7 |         7 |         0 |   22 |
| memo                       |         3 |           0 |         0 |         0 |    3 |
| spec/dll                   |         4 |           0 |         0 |         0 |    4 |
| spec/fmo-mutex             |         0 |           0 |         3 |         0 |    3 |
| spec/headline              |         8 |           0 |         0 |         0 |    8 |
| spec/plugin                |         0 |           0 |        12 |         0 |   12 |
| spec/saori-ex              |         2 |           0 |        41 |         0 |   43 |
| spec/shiori3               |        26 |           0 |         1 |         0 |   27 |
| spec/sstp                  |         0 |           0 |        10 |         0 |   10 |
| spec/update-file           |         0 |           5 |         1 |         0 |    6 |
| spec/web                   |         0 |           0 |         2 |         0 |    2 |
| ssp/about                  |         5 |           0 |         0 |         0 |    5 |
| ssp/config                 |        10 |           5 |         2 |         0 |   17 |
| ssp/dev                    |         4 |           1 |         0 |         0 |    5 |
| ssp/extra-spec             |         3 |           0 |         0 |         0 |    3 |
| ssp/functions              |        14 |           2 |         1 |         0 |   17 |
| ssp/howto                  |         6 |           1 |         0 |         0 |    7 |
| **合計** |       701 |          81 |      1239 |         3 | 2024 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
