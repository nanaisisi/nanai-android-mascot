# ukadoc-spec & ukadoc-ssp 規格別 実装突合マスタサマリ

各項目ファイルの公式仕様に対する実装状況の自動集計結果です。

| 規格 (ukadoc-spec / ukadoc-ssp 層 + 1階層) | ✅ 実装済 | ⚠️ 一部対応 | ❌ 未実装 | ❓ 未確認 | 合計 |
| :--- | --------: | ----------: | --------: | --------: | ---: |
| nas-spec/android-overlay-and-service-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/composition-plan-integration-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/context-menu-spec.md        |         1 |           0 |         0 |         0 |    1 |
| nas-spec/encoding-and-vfs-spec.md    |         1 |           0 |         0 |         0 |    1 |
| nas-spec/ghost-import-and-asset-separation-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/plugin-and-shiori-fallback-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/sakura-script-and-balloon-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/shell-menu-pictures-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/shiori-integration.md       |         1 |           0 |         0 |         0 |    1 |
| nas-spec/ssp-compatibility-reference.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/ssp-font-and-ui-spec.md     |         1 |           0 |         0 |         0 |    1 |
| nas-spec/ssp-master-compatibility-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/standard-ghost-spec.md      |         1 |           0 |         0 |         0 |    1 |
| nas-spec/submenu-window-spec.md      |         1 |           0 |         0 |         0 |    1 |
| nas-spec/surfaces-and-collision-spec.md |         1 |           0 |         0 |         0 |    1 |
| nas-spec/wasm-and-plugin-extensibility.md |         1 |           0 |         0 |         0 |    1 |
| ssp-external-spec/explorer.md        |         1 |           0 |         0 |         0 |    1 |
| ssp-external-spec/menu-bitmap.md     |         1 |           0 |         0 |         0 |    1 |
| ssp-external-spec/window-snap.md     |         1 |           0 |         0 |         0 |    1 |
| ukadoc-spec/descript                 |       293 |           3 |       267 |         0 |  563 |
| ukadoc-spec/dev                      |         5 |           0 |         2 |         0 |    7 |
| ukadoc-spec/list                     |       632 |           0 |       628 |         0 | 1260 |
| ukadoc-spec/manual                   |        22 |           0 |        44 |         0 |   66 |
| ukadoc-spec/memo                     |         2 |           0 |         1 |         0 |    3 |
| ukadoc-spec/spec                     |        46 |           0 |        69 |         0 |  115 |
| ukadoc-ssp/about                     |         3 |           0 |         2 |         0 |    5 |
| ukadoc-ssp/config                    |        10 |           0 |         7 |         0 |   17 |
| ukadoc-ssp/dev                       |         2 |           0 |         3 |         0 |    5 |
| ukadoc-ssp/functions                 |        13 |           0 |         4 |         0 |   17 |
| ukadoc-ssp/howto                     |         5 |           0 |         2 |         0 |    7 |
| **合計** |      1052 |           3 |      1029 |         0 | 2084 |

## 注意

- ❌ 未実装には、検索で見つからない項目 (処理が別名で存在する場合の見落とし) および汎用キーワード誤検出項目を含みます。
- ⚠️ 一部対応のうち「読込のみ」は、値の読込までを確認し、動作への反映は未確認です。
