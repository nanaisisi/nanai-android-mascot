# 規格対応度一覧（Specification Compliance Matrix）

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukatech/ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukatech/ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukatech/ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukatech/ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「伺か（UKAGAKA）」関連規格、および現代プラットフォーム（Windows / Android）向け標準規格への対応状況・進捗マトリクスです。

> **コード突合注記 (2026-10-28)**: 以下の対応率は網羅的な適合試験の合格率ではなく、従来の進捗目安です。
> 実装と文書の突合で、NAR導入は Ghost/Balloon のみ、`userData/ghost` 優先探索、
> 外部 translator、owner-draw-menu、plugin/headline 導入は対応完了しています。
> 詳細な判定は [ukadoc-manual-compliance.md](../compliance/ukadoc-manual-compliance.md) を参照してください。

---

## 1. 規格対応サマリー

| 規格・仕様群                              | 概要                                                 | 対応度  | 主な実装状況 / 今後の方針                                                                                                                                                                                                                                                                               |
| :---------------------------------------- | :--------------------------------------------------- | :-----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SHIORI 3.0**                            | ゴースト頭脳・イベント通信プロトコル                 | **92%** | SHIORI 3.0 リクエスト/レスポンスパーサー、主要基本イベント、ネットワーク更新 (`OnUpdate*` / `OnUpdateCheck*` / ファイル単位進捗、updates2.dau 差分、`OnUpdateResultExplorer`)、メールチェック (`OnBIFF*` / `OnBIFF2Complete`)、Web Worker 非同期実行実装済。C/C++系ネイティブSHIORIのWASM化が継続課題。 |
| **さくらスクリプト (Sakura Script)**      | テキスト送出・タグ制御プロトコル                     | **96%** | `\0`, `\1`, `\p[n]`, `\h`, `\u`, `\s[ID]`, `\w[N]`, `\_w[ms]`, `\q[text,id]`, `\_a[id]`, `\i[ID,wait]`, `\n[half]`, `\b`, `\x`, `\_q`, `\_s`, `\_l`, `\f`, `\e` 等の実装・文字送り制御完備。未対応 `\![...]` の JS 側汎用透過完備。                                                                     |
| **サーフィス仕様 (surfaces.txt / PNA)**   | 画像定義・重ね合わせ・当たり判定                     | **98%** | HTML5 Canvas 2D によるベース・差分合成、`collision` / `collisionex`(rect/polygon/circle/ellipse) 当たり判定、表示倍率逆算マッピング、PNAアルファマスク合成・BMP/PNG読込、エイリアス解決 (`surface.alias`)・基準点座標対応。着せ替えbindはメニューUI完備。                                               |
| **バルーン仕様 (balloon / descript.txt)** | 吹き出しスキン・フォント・配置定義                   | **85%** | `\0`, `\1` 独立バルーン、CSSテーマ着せ替え（モダン/アイボリー/コミック/ダーク）、`descript.txt` (フォント名/色/サイズ/選択肢色/validrectパディング/wordwrappoint折り返し/原点オフセット) の動的適用、倍率拡縮実装済。                                                                                   |
| **SSP 互換メニュー・操作体系**            | 右クリックメニュー・ショートカット・操作系           | **90%** | 伺か標準階層メニュー（iframe隔離）、シェル倍率切替、バルーン倍率切替、ドッキング退避、モーダルUI群実装済。                                                                                                                                                                                              |
| **ファイル配置・アーカイブ (NAR / VFS)**  | ゴースト配布形式・ファイルシステム・エンコーディング | **90%** | Shift_JIS (CP932) 読込、大文字小文字吸収、Zip Slip 防止、Ghost/Balloon の NAR/ZIP 展開、`userData/ghost`（ユーザデータ）優先探索機構実装済。                                                                                                                                                            |
| **プラットフォーム対応 (Tauri v2 / OS)**  | Windows 透過オーバーレイ / Android 最適化            | **75%** | Windows 完全透過・クリックスルー・マウス操作・キーバインド実装済。Android タッチスワイプ・端スナップ実装済（常駐サービス・AlertWindow化継続）。                                                                                                                                                         |

---

## 2. 詳細仕様別マトリクス

### 2.1 SHIORI プロトコル & イベント通信

| 項目 / 規格                  | 対象仕様                                   |     対応状況      | 詳細・備考                                                                                                                                                                                                                                                                          |
| :--------------------------- | :----------------------------------------- | :---------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SHIORI 3.0 プロトコル**    | `GET Version SHIORI/3.0`, `GET SHIORI/3.0` |     ✅ 対応済     | `src/js/shiori-protocol.js` にてリクエスト/レスポンスヘッダパース完備                                                                                                                                                                                                               |
| **SHIORI 2.x プロトコル**    | `GET Sentence SHIORI/2.x` 等               | ⚠️ フォールバック | SHIORI 3.0 ラッパー経由、または標準JS SHIORIによるエミュレート                                                                                                                                                                                                                      |
| **Web Worker 実行**          | 非同期サンドボックス実行                   |     ✅ 対応済     | `src/js/shiori-worker.js` によりUIブロッキングなしで非同期処理                                                                                                                                                                                                                      |
| **C/C++ SHIORI (里々/YAYA)** | DLLネイティブ実行                          |     🚧 開発中     | WebAssembly (WASM) コンパイルによるブラウザ/Worker内実行を計画                                                                                                                                                                                                                      |
| **基本イベント**             | `OnBoot`, `OnClose`, `OnFirstBoot`         |     ✅ 対応済     | ライフサイクルイベントの送信・さくらスクリプト再生完備                                                                                                                                                                                                                              |
| **入力・タッチイベント**     | `OnMouseClick`, `OnMouseDoubleClick`       |     ✅ 対応済     | `当たり判定部位（head, bust, skirt 等）を識別して Reference 送信                                                                                                                                                                                                                    |
| **タイマーイベント**         | `OnSecondChange`, `OnMinuteChange`         |  ✅ Tags 対応済   | ゴースト側の時間変化検知・ランダムトークトリガー                                                                                                                                                                                                                                    |
| **選択肢イベント**           | `OnChoiceSelect`                           |     ✅ 対応済     | `\q` タグクリック時の ID/ラベル引数渡し                                                                                                                                                                                                                                             |
| **ネットワークイベント**     | `OnUpdate*`, `OnUpdateCheck*`, `OnBIFF*`   |     ✅ 対応済     | OnUpdateBegin/Ready/Complete/Failure + ファイル単位 per-file 進捗 + 更新チェックのみ (OnUpdateCheckComplete/Failure) + 一括結果通知 (OnUpdateResult/ResultEx, CheckResult系) + OnUpdateResultExplorer、および OnBIFFBegin/Complete/2Complete/Failure メールチェックパイプライン完備 |

### 2.2 さくらスクリプト (Sakura Script)

| タグ                            | 説明                           | 対応状況  | 詳細・備考                                                                          |
| :------------------------------ | :----------------------------- | :-------: | :---------------------------------------------------------------------------------- |
| `\0`, `\h`, `\u`, `\1`, `\p[n]` | スコープ（話者）切り替え       | ✅ 対応済 | `\0` (メイン) / `\1` (相方) のスコープ管理および吹き出し独立配置                    |
| `\s[ID]`                        | サーフィス（表情・ポーズ）変更 | ✅ 対応済 | Canvas 2D レンダラと連動して即時表情切り替え                                        |
| `\w[N]`, `\_w[N]`               | ウェイト（待ち時間）制御       | ✅ 対応済 | 文字単位のウェイト（50ms単位）およびミリ秒指定ウェイト                              |
| `\n`, `\n[half]`                | 改行 / 行間制御                | ✅ 対応済 | 改行および半行余白挿入の展開、テキストキューイング                                  |
| `\q[表示名,ID]`                 | 選択肢ボタン生成               | ✅ 対応済 | クリック可能なインラインボタン化、`OnChoiceSelect` 送信                             |
| `\_a[ID]...\_a`                 | アンカーリンク                 | ✅ 対応済 | クリッカブルなインラインリンク化、`OnAnchorSelect` 送信                             |
| `\e`                            | スクリプト終了                 | ✅ 対応済 | トーク終了、タイマーリセット、入力待機状態への遷移                                  |
| `\c`                            | バルーン消去                   | ✅ 対応済 | バルーン表示テキストの即時クリア                                                    |
| `\b[ID]`                        | バルーン切り替え               | ✅ 対応済 | `\b[0]` 等のサーフィス切り替え、`\b[-1]` バルーン非表示                             |
| `\x`                            | クリック待ち                   | ✅ 対応済 | タップ/クリックまたはキー入力・スキップされるまで文字送り待機（タイムアウト付き）   |
| `\_q`                           | クイック描画制御               | ✅ 対応済 | `\_q`, `\_q[1]` (高速表示ON), `\_q[0]` (高速表示OFF) によるテキスト一括即時表示制御 |
| `\i[ID]`, `\i[ID,wait]`         | アニメーション直接再生         | ✅ 対応済 | SERIKO アニメーション即時再生・完了待機（旧形式 `\i0`〜`\i9` 対応）                 |
| `\![raise,...]`                 | イベント強制発火               | ✅ 対応済 | さくらスクリプト側からの SHIORI イベントディスパッチ                                |
| `\![bind,cat,part,opt]`         | 着せ替えパーツ制御             | ✅ 対応済 | カテゴリ・パーツ名を指定した着せ替え状態の変更                                      |
| `\![...]` その他                | 拡張コマンド汎用透過           | ✅ 対応済 | Rust パーサーが未知の `\![...]` `Command` として JS 側の透過                        |
| `\t`                            | タイムクリティカルセクション   | ✅ 対応済 | スクリプトブレーク/`\e` までマウス系イベント通知を抑止（UKADOC準拠）                |
| `\-`                            | ゴースト終了                   | ✅ 対応済 | トーク終了時にゴースト終了処理を実行                                                |
| `\_l[X,Y]`                      | 描画座標オフセット             | ✅ 対応済 | `\_l[X,Y]` (絶対座標) および `\_l[@X,@Y]` (相対座標) による描画位置制御             |
