# sstp 項目別突合

規格 (ukadoc-spec/spec/sstp) の項目ごとの突合結果です。実装コードの文字列検索による一次調査です。

| 項目                                 | 対応状況  | 備考                                                 |
| :----------------------------------- | :-------: | :--------------------------------------------------- |
| [Direct SSTP](direct.md)             | ✅ 実装済 | Direct SSTP リクエスト解析・コマンド発行に対応       |
| [SSTP over HTTP](http.md)            | ✅ 実装済 | HTTP SSTP リクエスト連携インターフェース実装済       |
| [keep-alive](keepalive.md)           | ✅ 実装済 | SSTP keep-alive 接続維持プロトコル対応               |
| [COMMUNICATE](method_communicate.md) | ✅ 実装済 | COMMUNICATE メソッド処理およびイベント発行に対応     |
| [EXECUTE](method_execute.md)         | ✅ 実装済 | EXECUTE メソッドおよび各種プロパティ・コマンドに対応 |
| [GIVE](method_give.md)               | ✅ 実装済 | GIVE メソッド（スクリプト・ドキュメント・楽曲）対応  |
| [NOTIFY](method_notify.md)           | ✅ 実装済 | SSTP NOTIFY メソッド処理に対応                       |
| [SEND](method_send.md)               | ✅ 実装済 | SEND メソッドおよびスクリプト実行イベント発行に対応  |
| [request/response](req_res.md)       | ✅ 実装済 | SSTP 1.1/1.2 リクエスト/レスポンス生成・解析に対応   |
| [概要](sstp.md)                      | ✅ 実装済 | SSTP 規格プロトコルおよびハンドラ群完備              |
