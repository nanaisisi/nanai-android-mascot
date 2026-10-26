# SHIORI/3.0 項目別突合

規格 (ukadoc-spec/spec/shiori3) の項目ごとの突合結果です。

| 項目 | 区分 | 対応状況 | 備考 |
| :--- | :--- | :------: | :--- |
| [capability](capability.md) | capability | ❌ 未実装 | Capability 系ヘッダ・イベント処理は未実装 |
| [request: メソッド (GET / NOTIFY)](request-method.md) | request | ✅ 対応済 | `crates/ui/src/shiori.rs` にて GET / NOTIFY 対応 |
| [request: ID](request-id.md) | request | ✅ 対応済 | イベント名・ID ヘッダ |
| [request: Charset](request-charset.md) | request | ✅ 対応済 | 文字エンコーディング指定 (UTF-8 / Shift_JIS) |
| [request: Sender](request-sender.md) | request | ✅ 対応済 | 送信元クライアント識別名 |
| [request: Reference*](request-reference.md) | request | ✅ 対応済 | 引数配列 Reference0〜ReferenceN |
| [request: Status](request-status.md) | request | ✅ 対応済 | 状態フラグ (talking, choosing 等) |
| [request: SecurityLevel](request-securitylevel.md) | request | ✅ 対応済 | セキュリティレベル (local / external) |
| [request: SecurityOrigin](request-securityorigin.md) | request | ✅ 対応済 | 送信元オリジン識別 |
| [request: BaseID](request-baseid.md) | request | ✅ 対応済 | SSP 拡張 BaseID |
| [request: SenderType](request-sendertype.md) | request | ✅ 対応済 | 送信元種別 |
| [request: X-SSTP-PassThru-*](request-passthru.md) | request | ✅ 対応済 | パススルーヘッダ透過 |
| [response: ステータスコード](response-statuscode.md) | response | ✅ 対応済 | 200 OK, 204 No Content, 311/312 Teach, 4xx/5xx |
| [response: Charset](response-charset.md) | response | ✅ 対応済 | 文字エンコーディング指定 |
| [response: Sender](response-sender.md) | response | ✅ 対応済 | 応答元識別 |
| [response: Value](response-value.md) | response | ✅ 対応済 | さくらスクリプト / 返答本文 |
| [response: ValueNotify](response-valuenotify.md) | response | ✅ 対応済 | ValueNotify 通知 |
| [response: Reference0](response-reference0.md) | response | ✅ 対応済 | 応答参照引数 Reference0 |
| [response: Reference1](response-reference1.md) | response | ✅ 対応済 | 応答参照引数 Reference1 |
| [response: SecurityLevel](response-securitylevel.md) | response | ✅ 対応済 | 応答セキュリティレベル |
| [response: BalloonOffset](response-balloonoffset.md) | response | ✅ 対応済 | バルーン表示オフセット |
| [response: Marker](response-marker.md) | response | ✅ 対応済 | マーカー |
| [response: MarkerSend](response-markersend.md) | response | ✅ 対応済 | マーカー送信指示 |
| [response: Age](response-age.md) | response | ✅ 対応済 | キャッシュ有効期限 |
| [response: ErrorLevel](response-errorlevel.md) | response | ✅ 対応済 | エラー重大度 (warning / error / critical) |
| [response: ErrorDescription](response-errordescription.md) | response | ✅ 対応済 | エラー詳細メッセージ |
| [response: X-SSTP-PassThru-*](response-passthru.md) | response | ✅ 対応済 | 応答パススルーヘッダ |
