# 規格対応度一覧（Specification Compliance Matrix）

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「伺か（UKAGAKA）」関連規格、および現代プラットフォーム（Windows / Android）向け標準規格への対応状況・進捗マトリクスです。

---

## 1. 規格対応サマリー

| 規格・仕様群                              | 概要                                                 | 対応度  | 主な実装状況 / 今後の方針                                                                                                                               |
| :---------------------------------------- | :--------------------------------------------------- | :-----: | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SHIORI 3.0**                            | ゴースト頭脳・イベント通信プロトコル                 | **87%** | SHIORI 3.0 リクエスト/レスポンスパーサー、主要基本イベント、ネットワーク更新 (`OnUpdate*` / `OnUpdateCheck*` / ファイル単位進捗、updates2.dau 差分)、Web Worker 非同期実行実装済。C/C++系ネイティブSHIORIのWASM化・OnUpdateResult*/OnBIFF系が継続課題。                    |
| **さくらスクリプト (Sakura Script)**      | テキスト送出・タグ制御プロトコル                     | **85%** | `\0`, `\1`, `\h`, `\u`, `\s[ID]`, `\w[N]`, `\q[text,id]`, `\i[ID,wait]`, `\n[half]`, `\e` 等のタグパーサー実装済（Rust 統一）。未対応 `\![...]` の JS 側への汎用透過完備。特殊演出タグは順次拡充。 |
| **サーフィス仕様 (surfaces.txt / PNA)**   | 画像定義・重ね合わせ・当たり判定                     | **90%** | HTML5 Canvas 2D によるベース・差分合成、`collision` / `collisionex`(rect/polygon/circle/ellipse) 当たり判定、表示倍率逆算マッピング実装済。PNA/透過PNG対応。着せ替えbindはメニューUI完備。       |
| **バルーン仕様 (balloon / descript.txt)** | 吹き出しスキン・フォント・配置定義                   | **75%** | `\0`, `\1` 独立バルーン、CSSテーマ着せ替え（モダン/アイボリー/コミック/ダーク）、倍率拡縮実装済。SSP固有の細部座標定義解釈は順次拡充。                  |
| **SSP 互換メニュー・操作体系**            | 右クリックメニュー・ショートカット・操作系           | **85%** | 伺か標準階層メニュー（iframe隔離）、シェル倍率切替（50%〜200%）、ドッキング退避、モーダルUI群（設定/情報/一覧）実装済。                                 |
| **ファイル配置・アーカイブ (NAR / VFS)**  | ゴースト配布形式・ファイルシステム・エンコーディング | **90%** | Shift_JIS (CP932) ↔ UTF-8 自動判別・透過読込、大文字小文字吸収 VFS 実装済。NAR/zip 自動展開（install.txt `type` 検証・Zip Slip 防止完備）。シェル/バルーン単体 NAR は非対応。 |
| **プラットフォーム対応 (Tauri v2 / OS)**  | Windows 透過オーバーレイ / Android 最適化            | **75%** | Windows 完全透過・クリックスルー・マウス操作・キーバインド実装済。Android タッチスワイプ・端スナップ実装済（常駐サービス・AlertWindow化継続）。         |

---

## 2. 詳細仕様別マトリクス

### 2.1 SHIORI プロトコル & イベント通信

| 項目 / 規格                  | 対象仕様                                   |     対応状況      | 詳細・備考                                                            |
| :--------------------------- | :----------------------------------------- | :---------------: | :-------------------------------------------------------------------- |
| **SHIORI 3.0 プロトコル**    | `GET Version SHIORI/3.0`, `GET SHIORI/3.0` |     ✅ 対応済     | `src/js/shiori-protocol.js` にてリクエスト/レスポンスヘッダパース完備 |
| **SHIORI 2.x プロトコル**    | `GET Sentence SHIORI/2.x` 等               | ⚠️ フォールバック | SHIORI 3.0 ラッパー経由、または標準JS SHIORIによるエミュレート        |
| **Web Worker 実行**          | 非同期サンドボックス実行                   |     ✅ 対応済     | `src/js/shiori-worker.js` によりUIブロッキングなしで非同期処理        |
| **C/C++ SHIORI (里々/YAYA)** | DLLネイティブ実行                          |     🚧 開発中     | WebAssembly (WASM) コンパイルによるブラウザ/Worker内実行を計画        |
| **基本イベント**             | `OnBoot`, `OnClose`, `OnFirstBoot`         |     ✅ 対応済     | ライフサイクルイベントの送信・さくらスクリプト再生完備                |
| **入力・タッチイベント**     | `OnMouseClick`, `OnMouseDoubleClick`       |     ✅ 対応済     | 当たり判定部位（head, bust, skirt 等）を識別して Reference 送信       |
| **タイマーイベント**         | `OnSecondChange`, `OnMinuteChange`         |     ✅ 対応済     | ゴースト側の時間変化検知・ランダムトークトリガー                      |
| **選択肢イベント**           | `OnChoiceSelect`                           |     ✅ 対応済     | `\q` タグクリック時の ID/ラベル引数渡し                               |
| **ネットワークイベント**     | `OnUpdate*`, `OnUpdateCheck*`, `OnBIFF`    |    🚧 一部対応    | OnUpdateBegin/Ready/Complete/Failure + ファイル単位 per-file 進捗イベント + 更新チェックのみ (OnUpdateCheckComplete/Failure) + 一括結果通知 (OnUpdateResult/ResultEx, CheckResult 系)。OnBIFF/OnUpdateResultExplorer は未対応 |

### 2.2 さくらスクリプト (Sakura Script)

| タグ                            | 説明                           |  対応状況   | 詳細・備考                                                       |
| :------------------------------ | :----------------------------- | :---------: | :--------------------------------------------------------------- |
| `\0`, `\h`, `\u`, `\1`, `\p[n]` | スコープ（話者）切り替え       |  ✅ 対応済  | `\0` (メイン) / `\1` (相方) のスコープ管理および吹き出し独立配置 |
| `\s[ID]`                        | サーフィス（表情・ポーズ）変更 |  ✅ 対応済  | Canvas 2D レンダラと連動して即時表情切り替え                     |
| `\w[N]`, `\_w[N]`               | ウェイト（待ち時間）制御       |  ✅ 対応済  | 文字単位のウェイトおよび指定ミリ秒の同期/非同期ウェイト          |
| `\n`, `\n[half]`                | 改行 / 行間制御                |  ✅ 対応済  | 改行タグの展開、テキストキューイング                             |
| `\q[表示名,ID]`                 | 選択肢ボタン生成               |  ✅ 対応済  | クリック可能なインラインボタン化、`OnChoiceSelect` 送信          |
| `\e`                            | スクリプト終了                 |  ✅ 対応済  | トーク終了、タイマーリセット、入力待機状態への遷移               |
| `\b[ID]`                        | バルーン切り替え               | ⚠️ 部分対応 | 基本バルーン表示・切り替えに対応（特殊形状指定は順次）           |
| `\x`, `\_q`                     | クリック待ち / クイック描画    | ⚠️ 部分対応 | クリック待機および一括即時表示の基本制御                         |
| `\![raise,...]`                 | イベント強制発火               |  ✅ 対応済  | さくらスクリプト側からの SHIORI イベントディスパッチ（他の `\![...]` も JS ディスパッチへ汎用透過） |
| `\t`                            | タイムクリティカルセクション   |  ✅ 対応済  | スクリプトブレーク/`\e` までマウス系イベント（つつき・撫で）通知を抑止（UKADOC準拠） |

### 2.3 サーフィス・グラフィックス (`surfaces.txt` / PNG)

| 項目                            | 対象仕様                              |  対応状況   | 詳細・備考                                             |
| :------------------------------ | :------------------------------------ | :---------: | :----------------------------------------------------- |
| **ベース画像描画**              | `surface0.png` 等の基準描画           |  ✅ 対応済  | 透明度（アルファチャンネル）を維持した Canvas 2D 描画  |
| **差分合成 (element)**          | `element[ID],overlay/replace,...`     |  ✅ 対応済  | 表情差分パーツ（目・口等）の合成レンダリング           |
| **当たり判定 (collision)**      | `collision[ID],X1,Y1,X2,Y2,Name`      |  ✅ 対応済  | 矩形判定、表示倍率を逆算した座標変換、部位名取得       |
| **円形/楕円判定 (collisionex)** | `collisionex[ID],Name,circle/ellipse` |  ✅ 対応済  | circle/ellipse を型付き形状として点内包判定（rect/polygon も維持） |
| **アニメーション (animation)**  | `animation[ID].interval` 等          |  ✅ 対応済  | interval 全種（sometimes/always/runonce/periodic/random/talk 等）再生、SERIKO pattern 差分合成（overlay/replace）、口パク・`\i`・`\![anim,pause/resume]` 対応 |
| **着せ替え (bind)**             | `bind` オプションによる着脱           |  ✅ 対応済  | bindgroup メニュー（mustselect 排他含む）、bind レイヤーの常時合成、`OnDressupChanged` 送信       |
| **PNA 透過マスク**              | 24bit BMP + 8bit グレースケールマスク | ⚠️ 部分対応 | アルファ付き PNG 形式を第一推奨とし、PNAは透過変換対応 |

### 2.4 バルーン・UI・メニュー体系

| 項目                       | 対象仕様                                | 対応状況  | 詳細・備考                                                      |
| :------------------------- | :-------------------------------------- | :-------: | :-------------------------------------------------------------- |
| **オーナードローメニュー** | 右クリック標準階層メニュー              | ✅ 対応済 | iframe 隔離によるセキュリティ確保、postMessage による双方向同期 |
| **シェル倍率変更**         | 50% / 75% / 100% / 125% / 150% / 200%   | ✅ 対応済 | メニューからのリアルタイム変倍、当たり判定連動                  |
| **バルーンテーマ**         | モダン / アイボリー / コミック / ダーク | ✅ 対応済 | CSS カスタムプロパティによる高品位テーマ切り替え                |
| **アクセスキー**           | メニュー括弧内アルファベット            | ✅ 対応済 | キーボードからのショートカット操作                              |
| **ドッキング退避**         | 画面端吸着・最小化                      | ✅ 対応済 | 画面端へのスナップ・退避タブ化・ワンタップ復帰                  |
| **モーダルUI**             | 設定 / ゴースト一覧 / 情報 / デバッグ   | ✅ 対応済 | Glassmorphism を採用したモダン Web モーダル                     |

### 2.5 ファイルシステム・エンコーディング・VFS

| 項目                           | 対象仕様                                        | 対応状況  | 詳細・備考                                                 |
| :----------------------------- | :---------------------------------------------- | :-------: | :--------------------------------------------------------- |
| **文字コード自動判別**         | Shift_JIS (CP932) / UTF-8 / EUC-JP              | ✅ 対応済 | `encoding_rs` を用いた Rust 側での透過デコード・相互変換   |
| **仮想ファイルシステム (VFS)** | 大文字・小文字表記揺れ吸収                      | ✅ 対応済 | Windows/Linux/Android 間のパスケース不一致を自動解決       |
| **アセット分離**               | `assets/ghost/`, `assets/balloon/`, `userData/` | ✅ 対応済 | 標準配布アセットとユーザー追加アセットのクリーンな分離     |
| **NAR アーカイブ展開**         | `.nar` (ZIP準拠) の解凍・導入                  | ✅ 対応済 | 自動インストール（ファイル選択/バイト列取り込み）、install.txt `type` 検証、Zip Slip 防止完備 |

### 2.6 プラットフォーム対応 (Windows / Android)

| プラットフォーム | 機能要件                        | 対応状況  | 詳細・備考                                               |
| :--------------- | :------------------------------ | :-------: | :------------------------------------------------------- |
| **Windows**      | 透過ウィンドウ / クリックスルー | ✅ 対応済 | `tauri.conf.json` での透過、非描画領域のポインタ透過制御 |
| **Windows**      | マウスドラッグ / 右クリック     | ✅ 対応済 | スムーズなウィンドウ移動、コンテキストメニュー           |
| **Android**      | タッチドラッグ / スワイプ退避   | ✅ 対応済 | タッチイベントによるキャラクター移動・画面端スナップ     |
| **Android**      | 常駐サービス / バックグラウンド | 🚧 開発中 | Foreground Service、通知トレイ常駐                       |
| **Android**      | `SYSTEM_ALERT_WINDOW`           | 🚧 開発中 | 他アプリ上への最前面オーバーレイ表示権限連携             |

---

## 3. 凡例

- ✅ **対応済 (Complete)**: コア機能が実装され、意図通りに動作検証済み。
- ⚠️ **部分対応 / フォールバック (Partial / Fallback)**: 主要機能は動作するが、一部特殊記法や完全互換のためのエミュレーションを含む。
- 🚧 **開発中 / 計画済 (In Progress / Planned)**: 仕様策定済み、または段階的マイルストーンにて実装進行中。
