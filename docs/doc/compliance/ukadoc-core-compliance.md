# Ukagaka Tech Team (ukadoc-spec) 基礎規格・開発者向け機能総合コンプライアンス (Core Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec (ベース・基礎規格)**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **ukadoc-ssp (SSP拡張規格)**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project / © PONapook 氏

Nanai Android Mascot における、SSP専用拡張（`ukadoc-ssp`）の枠を超えた、伺か標準基盤規格（`ukadoc-spec`）および開発者向け機能（`dev/`）の網羅的適合状況に関する総合リファレンス文書である。

---

## 1. 基礎仕様ディレクトリ別の対応状況 (`ukadoc-spec`)

| ディレクトリ / 分類 | 主要規格・対象ファイル                                   | 対応度  | 実装状況・主要対応コンポーネント                                                                                                                    |
| :------------------ | :------------------------------------------------------- | :-----: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`descript/`**     | ゴースト・バルーン・シェル・プラグイン・ヘッドライン記述 | **95%** | `descript.txt` (name, craftman, shiori, type, menu.*.bitmap, validrect, wordwrappoint 等) のShift_JIS/UTF-8両対応パースおよび動的スタイリング対応。 |
| **`dll/`**          | SHIORI / SAORI DLL インターフェース                      | **90%** | `load`, `unload`, `request` エントリポイント、32bit DLL用ホストプロセス（`shiori-host32`）、SAORI 1.0 (`EXECUTE SAORI`) 実行基盤。                  |
| **`fmo-mutex/`**    | FMO (File Mapping Object) & Mutex 状態共有               | **95%** | 起動中ゴーストの名前、サーフィス、パス情報を外部プロセスへ公開する `get_fmo_status` IPC エンドポイント実装。                                        |
| **`headline/`**     | ヘッドラインセンサー規格                                 | **90%** | `assets/headline/` 配下のヘッドラインフォルダおよび `descript.txt` の自動スキャン (`scan_headlines`) 実装済。                                       |
| **`list/`**         | さくらスクリプト・SHIORIイベント・プロパティ一覧         | **95%** | 主要イベント（`OnBoot`, `OnClose`, `OnSecondChange`, `OnChoiceSelect`, `OnTranslate`, `OnUpdate*`, `OnBIFF*`）およびプロパティシステム連携完備。    |
| **`shiori3/`**      | SHIORI/3.0 プロトコル仕様                                | **95%** | ヘッダパース、非同期 Web Worker サンドボックス実行、SHIORI 2.x 自動フォールバック・アダプター実装。                                                 |
| **`sstp/`**         | SSTP (SakuraScript Transfer Protocol)                    | **95%** | `SEND SSTP/1.1` 受信による外部アプリ・他ゴーストからのさくらスクリプト受信・即時発話中継 (`send_sstp_request`)。                                    |
| **`web/`**          | Web 連携・application/x-nar 関連                         | **90%** | NAR アーカイブ（`.nar` / `.zip`）の自動展開（Zip Slip 防止・エンコーディング自動判別）、マルチアーカイブ導入対応。                                  |

---

## 2. 開発者向け機能・デバッグ仕様 (`dev/`)

| 項目 / 規格                | 対象仕様ファイル   |  対応度  | 実装状況・動作仕様                                                                                                                      |
| :------------------------- | :----------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **開発者向けパレット**     | `dev/palette.md`   | **90%**  | さくらスクリプトを手動入力・送信して即座にテスト発話させるデバッグUIおよびコマンド連携基盤。                                            |
| **スクリプトログビューア** | `dev/scriptlog.md` | **90%**  | 発話スクリプトの履歴や、SHIORI イベントの送受信ログをリアルタイムで確認するデバッグログ機能。                                           |
| **開発用環境管理**         | `.dev_ignore` 制御 | **100%** | ゴーストフォルダ内に `.dev_ignore` ファイルが配置されている場合に、製品ビルドやエクスプローラから開発用ゴーストを確実に除外する仕組み。 |
