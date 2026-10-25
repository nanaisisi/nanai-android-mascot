# SSTP/1.x 規格対応仕様 (SSTP Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SSTP/1.x](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/)
- **プロトコル**: SSTP/1.1, SSTP/1.2, SSTP/1.3, SSTP/1.4, DirectSSTP
- **対応ステータス**: **設計・計画済（30%）**

---

## 1. 規格概要と Nanai 実装方針

SSTP (Sakura Script Transfer Protocol) は、外部アプリケーションからゴーストへさくらスクリプトを直接送信し、発言やリアクションを行わせるプロトコルです。

- **Windows 環境**:
  - Windows メッセージ (`WM_COMMUNICATE`) による DirectSSTP 受信。
  - ローカルループバックソケット (TCP port 9801 / 9821) での SSTP リクエスト受信。
- **Android 環境**:
  - Android Intent (`ACTION_SEND`, カスタム Broadcast/URI Scheme `sstp://`) によるアプリ間連携。
  - アプリ内部 WebSocket / Local Loopback による外部サービス連携。

---

## 2. メソッド / コマンド対応状況

| コマンド | バージョン | 対応状況 | 備考 / 計画 |
| :--- | :--- | :---: | :--- |
| `SEND SSTP/1.1` | 1.1 | 🚧 開発中 | さくらスクリプトの即時送信（Entry, Script ヘッダ） |
| `SEND SSTP/1.2` | 1.2 | 🚧 開発中 | さくらスクリプト送信（送信完了イベント通知等） |
| `NOTIFY SSTP/1.1` | 1.1 | 🚧 開発中 | SHIORI へのイベント通知エージェントとしての動作 |
| `EXECUTE SSTP/1.1` | 1.1 | 🚧 計画中 | ゴースト側コマンド（クローズ、切り替え等）の実行要求 |
| `GIVE SSTP/1.1` | 1.1 | 🚧 計画中 | さくらスクリプトトークの挿入 |
| `COMMUNICATE SSTP/1.1` | 1.1 | 🚧 計画中 | ゴースト間会話（コミュニケート）機能 |
| `DirectSSTP` | 全般 | 🚧 開発中 | プロセス間直接通信（Win32 / Rust バックエンド処理） |

---

## 3. セキュリティ・サンドボックス保護

- **セキュリティ制御**: 外部ネットワーク（WAN/LAN）からの不正な SSTP 要求をデフォルトで遮断し、`127.0.0.1` (ローカル) または明示的な許可トークンのみを受理。
