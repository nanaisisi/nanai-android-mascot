# ukadoc-spec 規格別 実装突合サマリ

各項目ファイルの「対応状況」を集計したものです。判定はソースの文字列検索と、一部の実装読解に基づきます。

| 規格                        | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :-------------------------- | --------: | ----------: | --------: | --------: | ---: |
| descript/balloon            |         0 |          14 |       156 |         0 |  170 |
| descript/ghost              |         0 |           8 |        68 |         0 |   76 |
| descript/headline           |         0 |           3 |         6 |         0 |    9 |
| descript/install            |         0 |           2 |        19 |         1 |   22 |
| descript/plugin             |         0 |           5 |         8 |         0 |   13 |
| descript/shell              |         0 |          10 |        93 |         0 |  103 |
| descript/shell-surfaces     |        11 |          14 |       127 |         2 |  154 |
| descript/shell-surfacetable |         0 |           1 |         6 |         0 |    7 |
| dll                         |         0 |           4 |         0 |         0 |    4 |
| fmo-mutex                   |         0 |           0 |         3 |         0 |    3 |
| headline                    |         0 |           0 |         8 |         0 |    8 |
| list/plugin-event           |         0 |           0 |        18 |         1 |   19 |
| list/propertysystem         |         0 |           1 |       195 |         1 |  197 |
| list/sakura-script          |        24 |          10 |       339 |         2 |  375 |
| list/shiori-event           |        21 |           2 |       303 |         3 |  329 |
| list/shiori-event-ex        |         0 |           0 |       178 |         0 |  178 |
| list/shiori-resource        |         0 |           6 |       154 |         2 |  162 |
| manual                      |         7 |           1 |         0 |         0 |    8 |
| plugin                      |         0 |           0 |        12 |         0 |   12 |
| shiori3                     |         7 |           2 |        18 |         0 |   27 |
| spec/saori-ex               |         0 |           0 |        43 |         0 |   43 |
| ssp/help-page               |        27 |          10 |        12 |         0 |   49 |
| ssp/menu                    |        15 |           1 |         1 |         0 |   17 |
| sstp                        |         0 |           0 |        10 |         0 |   10 |
| update-file                 |         0 |           5 |         1 |         0 |    6 |
| web                         |         0 |           0 |         2 |         0 |    2 |
| **合計**                    |       112 |          99 |      1780 |        12 | 2003 |

## 注意

- ❌ 未実装には、検索で見つからなかった項目 (処理が別名で存在する場合の見落とし) を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
