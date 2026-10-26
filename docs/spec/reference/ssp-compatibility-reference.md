# SSP 仕様ベース 統合互換リファレンスマニュアル

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **PLUGIN 規格**: [ukadoc-spec: plugin](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **FMO / Mutex 規格**: [ukadoc-spec: fmo-mutex](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

> **リファレンス基準**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) (SSP 2.7.x) / [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec)  
> **Web 版公式マニュアル**: [UKADOC Project (ssp.shillest.net/ukadoc/)](https://ssp.shillest.net/ukadoc/)  
> **本プロジェクトでの位置づけ**: デスクトップ版の基準実装である SSP の全機能・階層メニュー・設定・イベント体系をカタログ化し、**Nanai Android Mascot** における実装優先度・モバイル適応仕様を定めたサイト型統合リファレンス。

---

## 1. サイト型仕様マップ（Sitemap & Matrix）

```mermaid
flowchart TD
    SSP[SSP 2.7.x 互換仕様体系] --> RClick[1. 右クリックメニュー / 操作系]
    SSP --> Func[2. 内蔵機能 / ツール群]
    SSP --> Config[3. 本体設定 / コンフィグ]
    SSP --> Event[4. SHIORI 3.0 / イベント通信]
    SSP --> Dev[5. 開発者向け支援ツール]

    RClick --> M1[おすすめ / ポータル]
    RClick --> M2[ゴースト・シェル・バルーン切り替え]
    RClick --> M3[シェル倍率 50%〜200%]
    RClick --> M4[アイコン化 / 終了]

    Func --> F1[バックログ / 発言履歴]
    Func --> F2[カレンダー / スケジュール]
    Func --> F3[音声合成 / 認識]
    Func --> F4[FMO / キャッシュ開放]

    Config --> C1[一般・表示・喋り]
    Config --> C2[接続・POP・プロキシ]
    Config --> C3[文字コード判別・フォールバック]

    Event --> E1[OnBoot / OnClose]
    Event --> E2[OnMouseClick / OnMouseMove]
    Event --> E3[OnSecondChange / OnMinuteChange]
```

### 1.1 標準ディレクトリ構成・アセット分離仕様マッピング

SSP 標準の配置構造との互換性を確保しつつ、Git リポジトリ汚染を防ぐアセット分離仕様です（詳細は [ghost-import-and-asset-separation-spec.md](../ghost/ghost-import-and-asset-separation-spec.md) 参照）。

| ディレクトリ | SSP 標準の役割 | Nanai 実装仕様 | Git 管理ポリシー |
| :-: | :--- | :--- | :--- |
| `assets/ghost/` | ゴースト格納ディレクトリ (`ghost/`) | 各ゴースト (`ghost/master/`, `shell/master/`) を配置 | `mock_nanai` のみ追跡。導入ゴーストは Git 除外 |
| `assets/balloon/` | バルーン格納ディレクトリ (`balloon/`) | 吹き出しスキン (`descript.txt`, 画像アセット) を配置 | `default` のみ追跡。追加バルーンは Git 除外 |
| `userData/` | ユーザー設定・セーブデータ (`data/`) | 設定・セーブデータ・一時インポートファイル | 完全除外（ローカル専用データ領域） |

---

## 2. 右クリックメニュー（オーナードローメニュー）互換仕様

SSP の標準右クリックメニュー（`howto/rclick.md`）に対する、本プロジェクトでの対応状況およびモバイル向け再設計。

| # | SSP 標準メニュー項目 | サブキャラ表示 | 本プロジェクト（Nanai）実装仕様 | モバイル（Android）適応方針 |
| :-: | :--- | :-: | :--- | :--- |
| **1** | おすすめ | ◯ | [ui-and-menu-spec.md](../../design/ui/ui-and-menu-spec.md) にてブラウザ起動連携 | Android 標準インテント (`ACTION_VIEW`) でブラウザ起動 |
| **2** | ポータルサイト | - | ゴースト/シェル作者サイトへの URL 起動 | 同上 |
| **3** | ネットワーク更新 | - | `updates2.dau` / `updates.txt` によるオンライン差分取得 | Wi-Fi 接続時更新・バックグラウンド更新 |
| **4** | アンインストール (Vanish) | - | ゴーストディレクトリ削除ダイアログ | アプリ内部データ領域からの安全な削除 |
| **5** | RSS/ヘッドライン | - | ヘッドラインセンサ（Plugin）連携 | Web 標準 Fetch による RSS/Atom リーダーシム |
| **6** | プラグイン | - | JS / WASM プラグイン一覧実行 ([wasm-and-plugin-extensibility.md](../platform/wasm-and-plugin-extensibility.md)) | サンドボックス内 WebExtension 型プラグイン |
| **7** | メールチェック | - | POP3 メール着信確認 | 将来拡張（優先度: Low） |
| **8** | シェル倍率 | - | **50% / 75% / 100% / 125% / 150% / 200%** | ピンチイン/アウト操作およびスライダー調整 |
| **9** | 機能 | - | サブメニュー展開（カレンダー、バックログ等） | モーダルパネル形式での一覧展開 |
| **10** | 設定 | - | 本体設定ダイアログ | タブ形式のモダン設定モーダル |
| **11** | ゴースト切り替え | - | インストール済みゴースト一覧選択 | カルセール／カード選択 UI |
| **12** | 他のゴーストを呼ぶ | - | 複数ゴースト同時召喚（マルチゴースト） | 単一透過レイヤー内での多体配置（Phase 3） |
| **13** | シェル | - | インストール済み着せ替えシェルの切替 | シェルプレビュー付き切替シート |
| **14** | 着せ替え | ◯ | surfaces `bind` オプションのパーツ単位トグル | チェックボックス付きアパレル選択パネル |
| **15** | バルーン | - | スタイル（吹き出し）の切替 | 吹き出しテーマ選択 |
| **16** | 最近使ったもの | - | 履歴スタック（ゴースト・バルーン） | 最近使ったゴーストへのクイックアクセス |
| **17** | 情報 | - | SSP / ゴーストクレジット情報表示 | アプリバージョン & クレジットダイアログ |
| **18** | アイコン化 | - | 最小化・タスクトレイ格納 | **画面端スナップ（ドッキング）** / 通知領域退避 |
| **19** | Language | - | UI 言語切替（日本語 / 英語） | OS 言語自動追従 + 手動切替 |
| **20** | 終了 | ◯ | 対象ゴーストのクローズ処理 (`OnClose`) | 個別終了 |
| **21** | 全て終了 | ◯ | アプリケーション全体の完全終了 | 常駐サービス停止 & プロセス終了 |

---

## 3. 機能（Functions）サブメニュー仕様

SSP の「機能」項目（`functions/index.md`）に対する互換・再実装。

### 3.1 優先実装機能（Core Functions）

1. **バックログ（発言履歴） (`Ctrl+B`)**:
   - 会話ログをキャラクターアイコン・タイムスタンプ付きで保持・スクロール表示。
   - スクリプト再生中でも過去ログを遡れる独立ビュー。
2. **ゴースト再読み込み / 動作情報再読み込み**:
   - 辞書ファイルやサーフィス画像をホットリロード。
   - 開発時の検証サイクルを短縮。
3. **シェル位置 / バルーン位置初期化 (`Ctrl+Shift+F12` / `F10`)**:
   - 画面端へ追いやられたキャラクターや吹き出しを画面中央・標準位置へ即時復帰。
4. **バルーンを消す (`Ctrl+Shift+Del`)**:
   - 画面を塞ぐバルーンをワンタップ／ショートカットで強制クリア。

### 3.2 モバイル向け再設計機能（Mobile Adapted）

- **エクスプローラ (`Ctrl+E`)**:
  - ファイルマネージャではなく、モバイルに適した「ゴースト管理・NAR インストーラ・アセットブラウザ」として実装。
- **音声認識 & 音声合成**:
  - Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) を用いて、ブラウザ／WebView ネイティブで動作。

---

## 4. 本体設定（Configuration）体系

SSP の設定ダイアログ群（`config/index.md`）に対応する設定マトリクス。

```text
設定カテゴリ
├── 一般 (ippan): 開発者機能、自動起動、トレイアイコン挙動
├── ゴースト (ghost/ghost2): 会話頻度（おしゃべり度）、重複回避、キャッシュ管理
├── 表示 (disp): 透過アルゴリズム、拡縮補間（Nearest-Neighbor / Bilinear）、最前面表示
├── 喋り/バルーン (talk): 文字送り速度 (ms)、フォントファミリ、行間、自動消去秒数
├── 文字コード (charset): Shift_JIS(CP932) / UTF-8 自動判定・手動上書き
└── 開発/その他 (dev): スクリプトログ、未定義サーフィス非表示、エラーNoticeレベル通知
```

---

## 5. SHIORI / さくらスクリプト / サーフィス互換基準

| 規格 | 参照公式仕様 (ukadoc-spec) | Nanai 実装仕様書 | 互換目標 |
| :--- | :--- | :--- | :--- |
| **SHIORI/3.0** | [spec/shiori3 (UKADOC)](https://ssp.shillest.net/ukadoc/manual/spec_shiori3.html) | [shiori-integration.md](../shiori-script/shiori-integration.md) | 100% (Event & Response ヘッダ完全準拠) |
| **SakuraScript** | [list/sakura-script (UKADOC)](https://ssp.shillest.net/ukadoc/manual/spec_sakura_script.html) | [sakura-script-and-balloon-spec.md](../shiori-script/sakura-script-and-balloon-spec.md) | `\0`, `\1`, `\s`, `\w`, `\q`, `\n`, `\c`, `\e` 等主要タグ完全対応 |
| **surfaces.txt** | [descript/shell-surfaces (UKADOC)](https://ssp.shillest.net/ukadoc/manual/descript_surfaces.html) | [surfaces-and-collision-spec.md](../ghost/surfaces-and-collision-spec.md) | Canvas 2D レイヤー合成、アニメーション、Collision 判定 |
| **descript.txt** | [descript/ghost (UKADOC)](https://ssp.shillest.net/ukadoc/manual/descript_ghost.html) | [encoding-and-vfs-spec.md](../platform/encoding-and-vfs-spec.md) | Shift_JIS/UTF-8 自動判別、定義パース |

---

## 6. ドキュメント連携と関連リソース

- **公式リポジトリ・マニュアル**:
  - SSP 拡張仕様: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp)
  - UKADOC 公式仕様書: [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec)
  - 里々公式マニュアル: [ukatech/satori-docs](https://github.com/ukatech/satori-docs)
  - YAYA 公式マニュアル: [YAYA-shiori/yaya-docs](https://github.com/YAYA-shiori/yaya-docs)
- **プロジェクト詳細仕様**:
  - ゴースト取り込み & アセット分離: [ghost-import-and-asset-separation-spec.md](../ghost/ghost-import-and-asset-separation-spec.md)
  - UI/メニュー設計: [ui-and-menu-spec.md](../../design/ui/ui-and-menu-spec.md)
  - Android 固有常駐仕様: [android-overlay-and-service-spec.md](../platform/android-overlay-and-service-spec.md)
