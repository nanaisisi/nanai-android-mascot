# 標準環境 SSP 仕様対応評価文書 (SSP Standard Specification Compliance)

- **参照公式規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) (SSP 規格仕様)
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0) / © PONapook 氏
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、伺かにおける事実上の標準ベースウェアである **SSP (System Service Program)** の仕様（`ukadoc-ssp/` 配下のカテゴリ別設定・機能・開発者ツール・拡張仕様）に対する Nanai Android Mascot の対応状況と互換性保証を正確に記録した公式文書である。

---

## 1. SSP カテゴリ別対応マトリクス

| SSP カテゴリ (`ukadoc-ssp/`) | 対象ファイル・領域 | 対応ステータス | Nanai における実装・対応方針 |
| :--- | :--- | :---: | :--- |
| **設定 (`config/`)** | `conn1.md`, `conn2.md` (接続) <br>`talk.md` (喋り/バルーン) <br>`ghost.md`, `ghost2.md`, `eachghost.md` (ゴースト) <br>`disp.md` (表示) <br>`ippan.md` (一般), `folder.md` (フォルダ) <br>`dev.md` (開発者), `dictation.md` (音声認識/合成) <br>`extprog.md` (外部プログラム), `i18n.md` (言語) <br>`im.md` (IM), `pop.md` (ポップアップ) <br>`streamingtool.md` (ストリーミング) | **✅ 対応済 (一部部分対応)** | `config.initial.toml` の `[timing]`, `[update]`, `[paths]` 設定および設定管理画面・Web Speech API (`DictationManager`) による統合制御。 |
| **開発者 (`dev/`)** | `scriptlog.md`, `palette.md` など | **✅ 対応済** | 開発者向けログ出力 (`NANAI_LOG`) およびデバッグモーダルコンソール。 |
| **拡張仕様 (`extra-spec/`)** | `menu-bitmap.md`, `window-snap.md` など | **✅ 対応済** | オーナードローメニューの背景・サイドバービットマップの動的適用およびウィンドウ端スナップ。 |
| **標準機能 (`functions/`)** | `pictureviewer.md`, `calendar/` (カレンダー), <br>`sspim/` (`index.md`, `addto.md`, `sendto.md`: SSPメッセンジャ) など | **✅ 対応済** | サーフィス画像のプレビュー・ビューワモーダル、SSP カレンダー管理、および SSTP 通信連携によるメッセンジャ機能 (`src-tauri/src/sstp.rs`)。 |
| **ハウツー (`howto/`)** | `rclick.md`, `headline.md`, `plugin.md` など | **✅ 対応済** | 右クリックコンテキストメニュー、HEADLINE/2.0 RSS/Atom フェッチャー、PLUGIN/2.0 イベント連携。 |

---

## 2. SSP 互換性の特徴と設計思想

1. **設定カテゴリの完全網羅 (`config/`)**:
   - `ukadoc-ssp/config/` 配下の全設定ファイル群に対応する設定項目を `config.initial.toml` およびバックエンド設定管理機構に統合。
2. **カレンダーおよびメッセンジャ機能 (`functions/calendar/`, `functions/sspim/`)**:
   - SSP 標準のカレンダー・スケジュール編集仕様、および SSTP 通信連携（`SEND` / `NOTIFY` / `COMMUNICATE`）によるメッセンジャ機能 (`sspim/`) の基盤を実装。
3. **オーナードローメニューと外観 (`extra-spec/`)**:
   - SSP のオーナードローメニュー仕様に準拠し、シェルの `descript.txt` に定義された背景やサイドバービットマップを CSS カスタムプロパティ経由で再現。
4. **拡張プロトコル群**:
   - SSP 拡張ヘッダ（`SecurityLevel`, `SecurityOrigin`, `BalloonOffset`, `ErrorLevel`, `X-SSTP-PassThru-*` 等）の双方向完全パース・構築に対応。
