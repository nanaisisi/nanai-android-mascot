# ukadoc-spec 規格別 実装突合サマリ

各項目ファイルの「対応状況」を集計したものです。判定はソースの文字列検索と、一部の実装読解に基づきます。

| 規格                        | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :-------------------------- | --------: | ----------: | --------: | --------: | ---: |
| descript/balloon            |        26 |          10 |       135 |         0 |  171 |
| descript/ghost              |         0 |           8 |        68 |         0 |   76 |
| descript/headline           |         0 |           3 |         6 |         0 |    9 |
| descript/install            |         0 |           4 |        18 |         0 |   22 |
| descript/plugin             |         0 |           5 |         8 |         0 |   13 |
| descript/shell              |        27 |           9 |        67 |         0 |  103 |
| descript/shell-surfaces     |        11 |          43 |       100 |         0 |  154 |
| descript/shell-surfacetable |         7 |           0 |         0 |         0 |    7 |
| list/plugin-event           |         4 |           0 |        14 |         1 |   19 |
| list/propertysystem         |         2 |           1 |       193 |         1 |  197 |
| list/sakura-script          |        29 |          10 |       336 |         0 |  375 |
| list/shiori-event           |        41 |           4 |       284 |         0 |  329 |
| list/shiori-event-ex        |         0 |           0 |       178 |         0 |  178 |
| list/shiori-resource        |         0 |           6 |       155 |         1 |  162 |
| spec/saori-ex               |         2 |           0 |        41 |         0 |   43 |
| **合計**                    |       149 |         103 |      1603 |         3 | 1858 |

## 注意

- ❌ 未実装には、検索で見つからなかった項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
