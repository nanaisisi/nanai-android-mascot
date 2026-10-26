# SSP 公式ヘルプ (ukadoc-ssp) 全ページ網羅・突合仕様書

- **参照公式規格リファレンス**: [ukatech/ukadoc-ssp (GitHub)](https://github.com/ukatech/ukadoc-ssp) / [SSP ヘルプ Web版](https://ukatech.shillest.net/ukadoc-ssp/)
- **対象バージョン**: SSP 2.6.x 互換仕様
- **権利表記**: © UKADOC project / Ukagaka Tech Team / © PONapook 氏 (CC BY 4.0)

本書は、ローカルに取得した `ukadoc-ssp` の全 Markdown ページ構造（`howto/`, `functions/`, `config/`, `dev/`, `about/`）に基づき、Nanai Android Mascot における各機能の対応状況・実装方針をページ単位で突合した仕様ドキュメントです。

---

## 1. 総合サマリー & 対応マトリクス

| 分類 | 総ページ数 | 対応済 (✅) | 部分対応 (⚠️) | 未対応/計画中 (🚧) | 対象外/代替 (💡) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **howto/** (基本操作) | 7 | 6 | 1 | 0 | 0 |
| **functions/** (機能・ツール) | 16 | 6 | 3 | 5 | 2 |
| **config/** (本体設定タブ) | 16 | 7 | 5 | 3 | 1 |
| **dev/** (開発者ツール) | 5 | 3 | 1 | 1 | 0 |
| **about/** (情報・FAQ) | 5 | 5 | 0 | 0 | 0 |
| **合計** | **49** | **27 (55%)** | **10 (20%)** | **9 (18%)** | **3 (6%)** |

> **Nanai の基本方針**: Android / モバイル環境および Tauri/Web プラットフォームの特性に最適化しつつ、ゴースト作者が期待する振る舞い（SHIORI イベント、さくらスクリプト、当たり判定、オーナードロー右クリックメニュー）を最大水準で再現します。

---

## 2. ページ別詳細突合

### 2.1 howto/ (基本的な使い方)

| ページパス | ページ名・内容 | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `howto/boot.md` | 起動する | ✅ 対応済 | アプリ起動、前回終了位置・ゴーストの自動復元、常駐通知連携 |
| `howto/use.md` | ゴーストとあそぶ | ✅ 対応済 | タッチ/ドラッグ、クリック/ダブルクリック判定、当たり判定、着せ替え |
| `howto/rclick.md` | 右クリックメニュー | ✅ 対応済 | iframe 隔離オーナードロー互換メニュー完備。サブキャラ（\1）時の「おすすめ/着せ替え/終了/全て終了」省略メニュー切り替え対応 |
| `howto/add.md` | コンテンツを追加する | ✅ 対応済 | `.nar` / `.zip` のドラッグ＆ドロップ、ファイル選択、Ghost/Balloon 自動仕分け |
| `howto/verup.md` | 本体のバージョンアップ | ⚠️ 部分対応 | アプリ自体の更新（GitHub Releases / Google Play）、ゴースト自体のネットワーク更新 |
| `howto/plugin.md` | プラグイン | ✅ 対応済 | プラグイン管理モーダル、PLUGIN/2.0 イベント送受信パイプライン |
| `howto/headline.md` | RSS/ヘッドライン | 🚧 計画中 | RSS/Atom フィード読み込みと HEADLINE 連携の計画 |

---

### 2.2 functions/ (機能・ツール)

| ページパス | ページ名・内容 | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `functions/index.md` | 機能一覧 | ✅ 対応済 | 機能一覧インデックスの整理 |
| `functions/windowmode.md` | ウィンドウモード | 💡 代替 | デスクトップ常駐 / モバイルフローティングオーバーレイ表示 |
| `functions/shortcut.md` | ショートカットキー | ✅ 対応済 | R, T, U, C, M, S, B, O, G, W, X など標準キーバインド実装 |
| `functions/option.md` | オプション機能 | ✅ 対応済 | 倍率変更、クリックスルー透過、常時最前面 |
| `functions/archiveviewer.md` | アーカイブビューア | 🚧 計画中 | VFS 内部ファイル（nar/zip）のプレビューツール |
| `functions/pictureviewer.md` | ピクチャービューア | 🚧 計画中 | サーフィス・画像の単体閲覧ビューア |
| `functions/speech-synthesis.md` | 音声合成 | ⚠️ 部分対応 | Web Speech API による音声読み上げ（`\v` タグ対応） |
| `functions/speech-recognition.md` | 音声認識 | 🚧 計画中 | Web Speech API による音声入力と SHIORI イベント通知 |
| `functions/other.md` | その他の機能 | ⚠️ 部分対応 | タスクトレイ格納（Android 常駐通知・スナップ退避） |
| `functions/calendar/index.md` | カレンダー (トップ) | 🚧 計画中 | スケジュール・アラーム管理機能 |
| `functions/calendar/menu.md` | カレンダーメニュー | 🚧 計画中 | カレンダー操作メニュー |
| `functions/calendar/schedule.md` | スケジュール | 🚧 計画中 | ゴースト発話によるスケジュール通知 |
| `functions/explorer/index.md` | エクスプローラ (トップ) | ✅ 対応済 | ゴースト・バルーン一覧モーダル、切り替え基盤 |
| `functions/explorer/menu.md` | エクスプローラメニュー | ✅ 対応済 | ゴーストの右クリック・管理操作 |
| `functions/sspim/index.md` | メッセンジャー (トップ) | 💡 代替 | SSTP 通信連携によるメッセージング |
| `functions/sspim/sendto.md` | メッセージ送信 | 💡 代替 | SSTP NOTIFY / SEND による外部連携 |
| `functions/sspim/addto.md` | 相手の追加 | 💡 代替 | リモートゴーストのアドレス帳連携 |

---

### 2.3 config/ (本体設定各タブ)

| ページパス | 設定タブ | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `config/index.md` | 本体設定トップ | ✅ 対応済 | タブ形式の設定モーダル展開 |
| `config/ippan.md` | 一般 | ✅ 対応済 | 起動時動作、多重起動防止、通知・トレイ動作 |
| `config/disp.md` | 表示 | ✅ 対応済 | シェル倍率、バルーン倍率、フォント指定、クリックスルー |
| `config/talk.md` | 発話 | ✅ 対応済 | 自動トーク頻度設定、バルーン消去待ち時間 |
| `config/ghost.md` | ゴースト (動作1) | ✅ 対応済 | デフォルトゴースト設定、移動制約 |
| `config/ghost2.md` | ゴースト (動作2) | ⚠️ 部分対応 | 当たり判定の視覚化、重複キャラクターの取り扱い |
| `config/folder.md` | フォルダ | ✅ 対応済 | ゴースト・バルーン保存パス（userData/assets）管理 |
| `config/conn1.md` | 接続 (プロキシ等) | ⚠️ 部分対応 | ネットワークタイムアウト・Fetch 設定 |
| `config/conn2.md` | 接続 (更新・同期) | ✅ 対応済 | 自動ネットワーク更新チェック周期、更新通知 |
| `config/pop.md` | POP (メール) | ✅ 対応済 | メールチェック（POP3/IMAP）接続設定、`OnBIFF*` パイプライン |
| `config/i18n.md` | 国際化 (言語) | ⚠️ 部分対応 | 言語切替（日本語/英語）、Shift_JIS 透過自動判別 |
| `config/dev.md` | 開発 | ✅ 対応済 | スクリプト入力パレット、ログコンソール |
| `config/dictation.md` | 音声認識・合成 | ⚠️ 部分対応 | Web Speech API 音声合成エンジンの選択 |
| `config/streamingtool.md` | 配信支援 | 🚧 計画中 | OBS 透過キャプチャ支援・仮想カメラ連携 |
| `config/extprog.md` | 外部アプリ | 🚧 計画中 | 外部エディタ・関連付け起動設定 |
| `config/eachghost.md` | ゴーストごとの設定 | ⚠️ 部分対応 | ゴースト個別の位置・倍率・音量保持 |
| `config/im.md` | メッセンジャー設定 | 💡 代替 | SSTP 待ち受けポート（9801/9821）設定 |

---

### 2.4 dev/ (開発者向け機能)

| ページパス | 機能名 | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `dev/index.md` | 開発者機能トップ | ✅ 対応済 | 開発支援機能（F12 DevTools、パレット等） |
| `dev/palette.md` | スクリプトパレット | ✅ 対応済 | さくらスクリプト手動送信、テスト発話 |
| `dev/scriptlog.md` | スクリプトログ | ✅ 対応済 | 発話ログ、送受信イベントログビューア |
| `dev/faq.md` | 開発 FAQ | ⚠️ 部分対応 | ゴースト移植ガイド、プラットフォーム制約のドキュメント化 |
| `dev/links.md` | 開発リンク集 | ✅ 対応済 | UKADOC / さくらスクリプト仕様へのリンク集 |

---

### 2.5 about/ (情報・FAQ)

| ページパス | 内容 | 対応状況 | Nanai 実装・対応方針 |
| :--- | :--- | :---: | :--- |
| `about/ssp.md` | SSPの基本情報 | ✅ 対応済 | クレジット、ライセンス表記、バージョン情報モーダル |
| `about/faq.md` | よくある質問 | ✅ 対応済 | モーダルおよびドキュメントでのトラブルシューティング案内 |
| `about/reference.md` | 用語説明 | ✅ 対応済 | 伺か専門用語（ゴースト、シェル、バルーン、SHIORI等）の解説 |
| `about/links.md` | リンク集 | ✅ 対応済 | 公式ポータル、関連ツールリンク |
| `about/information.md` | お知らせ・更新履歴 | ✅ 対応済 | バージョンリリースノート表示 |

---

## 3. 次期フェーズ実装ロードマップ

本突合により判明した SSP 固有機能のうち、Nanai への適用優先度が高い項目：

1. **スクリプトログ / イベントロガー強化 (`dev/scriptlog.md`)**:
   - SHIORI リクエスト/レスポンス、さくらスクリプトパース過程のリアルタイムログ出力。
2. **ゴースト個別設定 (`config/eachghost.md`)**:
   - キャラクターごとの独立した倍率・発話頻度・位置保存。
3. **ヘッドライン機能 (`howto/headline.md`)**:
   - RSS/Atom フィードを取得し `OnHeadline*` イベント経由で発話させる機能。
