# バルーン・プラグイン・ヘッドラインのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: update_balloon
- **対応状況**: ❌ 未実装

## 突合結果

`(myballoon)` 直下およびプラグイン・ヘッドライン各フォルダに `updates2.dau` / `updates.txt` / `delete.txt` / `developer_options.txt` を配置して個別更新を行う SSP 独自ネットワーク更新機能は未実装。`UPDATE_TARGET_TYPES`（`ui/ts/core/actions/update-protocol.ts:18-24`）と `OnUpdateOther*` 引数生成ヘルパー（`ui/ts/core/actions/update-protocol.ts:235-268`）に `"balloon"` / `"plugin"` / `"headline"` の種別定数は定義されているものの、各対象フォルダの `descript.txt` から `homeurl` を解決し更新を取得・適用するコマンドおよび UI フローは存在しない。

## 実装箇所

実装コード内に「update_balloon」は検出されませんでした。
