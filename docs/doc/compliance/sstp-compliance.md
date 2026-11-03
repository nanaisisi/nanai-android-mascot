# SSTP/1.x 規格対応仕様 (SSTP Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SSTP/1.x](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **SSTP (Sakura Script Transfer Protocol)**: [ukadoc-spec: sstp](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

- **プロトコル**: SSTP/1.1, SSTP/1.2, SSTP/1.3, SSTP/1.4, DirectSSTP
- **対応ステータス**: **実装済（90%）**

---

## 1. 規格概要と Nanai 実装方針

SSTP (Sakura Script Transfer Protocol) は、外部アプリケーションからゴーストへさくらスクリプトを直接送信し、発言やリアクションを行わせるプロトコルです。

- **通信・プロトコル基盤**:
  - `Connection: keep-alive` および `Keep-Alive: timeout=5` による継続的接続維持（UKADOC keepalive.md 規格準拠）。
  - `Content-Length` 自動算出および終端制御。
  - `ReceiverGhostName` / `ReceiverGhostHWnd` 検証および 404 Not Found 判定。
- **Windows 環境**:
  - Windows メッセージ (`WM_COMMUNICATE`) による DirectSSTP 受信。
  - ローカルループバックソケット (TCP port 9801 / 9821) での SSTP リクエスト受信。
- **Android 環境**:
  - Android Intent (`ACTION_SEND`, カスタム Broadcast/URI Scheme `sstp://`) によるアプリ間連携。
  - アプリ内部 WebSocket / Local Loopback による外部サービス連携。

---

## 2. メソッド / コマンド対応状況

| コマンド               | バージョン | 対応状況  | 備考 / 計画                                                                                  |
| :--------------------- | :--------- | :-------: | :------------------------------------------------------------------------------------------- |
| `SEND SSTP/1.1`        | 1.1        | ✅ 対応済 | さくらスクリプトの即時送信（Entry, Script, IfGhost ヘッダ）                                  |
| `SEND SSTP/1.2`        | 1.2        | ✅ 対応済 | さくらスクリプト送信（送信完了イベント通知等）                                               |
| `NOTIFY SSTP/1.1`      | 1.1        | ✅ 対応済 | SHIORI へのイベント通知エージェントとしての動作                                              |
| `EXECUTE SSTP/1.1`     | 1.1        | ✅ 対応済 | ゴースト情報取得（GetName, GetNames, GetVersion, GetStatus, GetFMO等）およびリモート制限制御 |
| `GIVE SSTP/1.1`        | 1.1        | ✅ 対応済 | さくらスクリプトトークの挿入（Document, Song, Script ヘッダ）                                |
| `COMMUNICATE SSTP/1.1` | 1.1        | ✅ 対応済 | ゴースト間会話（コミュニケート）機能 (`sstp.allowcommunicate` 制御連動)                     |
| `DirectSSTP`           | 全般       | ✅ 対応済 | プロセス間直接通信（Win32 / SAORI over DirectSSTP）                                          |

---

## 3. セキュリティ・サンドボックス保護

- **セキュリティ制御**: 外部ネットワーク（WAN/LAN）からの不正な SSTP 要求をデフォルトで遮断し、`127.0.0.1` (ローカル) または明示的な許可トークンのみを受理。
