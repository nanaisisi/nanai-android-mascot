# SHIORI 規格対応仕様 (SHIORI Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「SHIORI プロトコル」およびイベント通信規格への個別対応仕様です。

## 1. 概要と対応度

- **プロトコル規格**: SHIORI/3.0（および SHIORI/2.x エミュレーション）
- **対応度**: **92%**
- **主要実装ファイル**:
  - `crates/ui/src/shiori.rs`: SHIORI 3.0 リクエスト/レスポンス Rust 統一パーサー・モデル
  - `src-tauri/src/shiori/ffi.rs`: ネイティブ SHIORI DLL 連携およびリクエストビルダー (`on_biff_*` / `on_update_*`)
  - `ui/js/ghost/ghost.js`: イベントパイプライン・キューイング制御
  - `ui/js/core/app-actions.js`: `OnBIFF*` メールチェック、メニューアクション連携
  - `ui/js/core/app-update.js`: `OnUpdate*` ネットワーク更新制御パイプライン

---

## 2. プロトコル対応詳細

| 項目 / 規格                         | 対象仕様                                   |     対応状況      | 実装詳細・動作仕様                                                                                           |
| :---------------------------------- | :----------------------------------------- | :---------------: | :----------------------------------------------------------------------------------------------------------- |
| **SHIORI 3.0 プロトコル**           | `GET Version SHIORI/3.0`, `GET SHIORI/3.0` |     ✅ 対応済     | リクエストヘッダ（ID, Sender, Reference0..n）の構築とレスポンス（200 OK, 204 No Content, Value）の完全パース |
| **SHIORI 2.x プロトコル**           | `GET Sentence SHIORI/2.x` 等               | ⚠️ フォールバック | SHIORI 3.0 ラッパー経由、または標準JS SHIORIによるエミュレート                                               |
| **Web Worker 実行**                 | 非同期サンドボックス実行                   |     ✅ 対応済     | UIスレッドをブロックしない Web Worker 内での非同期 SHIORI 実行                                               |
| **C/C++ SHIORI (里々/YAYA/華和梨)** | DLL / .so 動的実行                         |     ✅ 対応済     | Windows (32bit/64bit DLL: shiori-host32経由含む) および Linux/Android (.so) の動的ロードに対応。`descript.txt` の `shiori` 設定に基づく自動検出とフォールバック探索を実装済 |

---

## 3. イベント対応詳細

| イベント名           | トリガー条件                 |  対応状況   | パラメータ (Reference) / 備考                                                                                                                                                                             |
| :------------------- | :--------------------------- | :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OnBoot`             | ゴースト起動時               |  ✅ 対応済  | Reference0: 起動シェル名。初回トークの再生                                                                                                                                |
| `OnClose`            | 終了操作時                   |  ✅ 対応済  | Reference0: 終了理由。終了トーク完了後にウィンドウ破棄                                                                                                                    |
| `OnFirstBoot`        | 初回インストール起動時       |  ✅ 対応済  | 初回専用トークの再生                                                                                                                                                      |
| `OnGhostChanged`     | ゴースト切り替え時           |  ✅ 対応済  | 切り替え元・先ゴースト名の受渡し                                                                                                                                          |
| `OnShellChanged`     | シェル着せ替え時             |  ✅ 対応済  | 新シェル名の受渡し                                                                                                                                                        |
| `OnMouseClick`       | キャラクタータップ/クリック  |  ✅ 対応済  | Reference0: X, Reference1: Y, Reference3: キャラID(\0 or \1), Reference4: 部位名(head, bust等)                                                                            |
| `OnMouseDoubleClick` | ダブルタップ/ダブルクリック  |  ✅ 対応済  | 同上                                                                                                                                                                      |
| `OnSecondChange`     | 毎秒タイマー                 |  ✅ 対応済  | ランダムトーク頻度計算、待機モーション制御                                                                                                                                |
| `OnMinuteChange`     | 毎分タイマー                 |  ✅ 対応済  | 時報トーク、バックグラウンド処理                                                                                                                                          |
| `OnChoiceSelect`     | さくらスクリプト `\q` 選択時 |  ✅ 対応済  | Reference0: 選択肢ID, Reference1: 選択肢テキスト                                                                                                                          |
| `OnUpdate*`          | ネットワーク更新実行時       |  ✅ 対応済  | OnUpdateProcessExec → OnUpdateBegin → OnUpdateReady → OnUpdate.OnDownloadBegin/OnMD5Compare* → OnUpdateComplete/Failure（Ref0 理由: none/changed/timeout/md5 miss/404/fileio、Ref3: ghost、Ref4: manual）。updates2.dau/updates.txt 差分取得実装済 |
| `OnUpdateCheck*`     | 更新チェックのみ実行時       |  ✅ 対応済  | メニュー「ネットワーク更新チェックのみ」(U/C キー) 時。OnUpdateCheckComplete (Ref0: 総数 or none)、OnUpdateCheckFailure (Ref0: 失敗理由)                                                                  |
| `OnUpdateResult*`    | 更新実行後の一括結果通知     |  ✅ 対応済  | 全更新終了後に OnUpdateResultEx → (スクリプト未返答なら) OnUpdateResult を送信。Reference0: (\1 区切り) 名前/種別/OK\|NG/件数または理由/失敗ファイル。チェックのみ時は OnUpdateCheckResult(Ex)          |
| `OnBIFF*`            | メールチェック実行時         |  ✅ 対応済  | OnBIFFBegin → POP3/アカウントチェック → OnBIFFComplete (Ref0: 通数, Ref1: サイズ, Ref2: アカウント名) / OnBIFF2Complete (ヘッダ情報付) / OnBIFFFailure (理由: connect/login等) 送信パイプライン完備 |
