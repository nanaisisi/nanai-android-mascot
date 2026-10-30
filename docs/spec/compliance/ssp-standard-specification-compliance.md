# 標準環境 SSP 仕様対応評価文書 (SSP Standard Specification Compliance)

- **参照公式規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) (SSP 規格仕様)
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0) / © PONapook 氏
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、伺かにおける事実上の標準ベースウェアである **SSP (System Service Program)** の仕様（`ukadoc-ssp/` 配下の設定、機能、開発者ツール、拡張仕様）に対する Nanai Android Mascot の対応状況と互換性保証を記録した公式文書である。

---

## 1. SSP 主要機能・設定仕様の対応マトリクス

| SSP 仕様カテゴリ (`ukadoc-ssp/`) | 対象機能・領域 | 対応ステータス | Nanai における実装・対応方針 |
| :--- | :--- | :---: | :--- |
| **設定ダイアログ** (`config/`) | 喋り、ゴースト、表示、接続、音声認識・合成等のタブ設定 | **✅ 対応済** | 設定モーダル画面、設定同期プロトコル (`AppConfig` / `AppSettings`)、倍率・タイミング調整機能。 |
| **開発者機能** (`dev/`) | スクリプトログ、パレット、デバッグログ表示 | **✅ 対応済** | 開発者向けログ出力 (`NANAI_LOG`)、さくらスクリプトプレイヤーツール、デバッグモーダルコンソール。 |
| **拡張仕様** (`extra-spec/`) | ゴーストエクスプローラ拡張、メニュービットマップ、ウィンドウ吸着・スナップ | **✅ 対応済** | オーナードローメニューの背景・サイドバービットマップ適用、ウィンドウ端スナップ・ドッキング退避機構。 |
| **標準機能** (`functions/`) | カレンダー、ピクチャビューワ、アーカイブビューワ、SSPI M 連携 | **⚠️ 部分対応** | カレンダー機能、モーダルビューワ、ファイルエクスプローラ連携、Web Speech API による音声合成・認識。 |
| **ハウツー** (`howto/`) | ゴースト追加、右クリックメニュー、ネットワーク更新・ヘッドライン | **✅ 対応済** | NAR アーカイブドラッグ＆ドロップインストール、右クリックコンテキストメニュー（ヘッドライン・プラグイン・メールチェック）。 |

---

## 2. SSP 互換性の特徴と設計思想

1. **メニューおよび見た目の互換性 (`extra-spec/menu-bitmap.md`)**:
   - SSP のオーナードローメニュー仕様に準拠し、シェルの `descript.txt` に定義された背景（`menu.background.bitmap.filename`）やサイドバービットマップを読み込み、CSS カスタムプロパティを通じて美しく再現。
2. **ウィンドウ操作・吸着 (`extra-spec/window-snap.md`)**:
   - デスクトップおよび Android プラットフォームにおけるウィンドウ端スナップ、ドラッグ移動、マルチキャラ（さくら・相方）配置の同期制御。
3. **拡張プロトコル群**:
   - SSP 拡張ヘッダ（`SecurityLevel`, `SecurityOrigin`, `BalloonOffset`, `ErrorLevel`, `X-SSTP-PassThru-*` 等）の双方向完全パース・構築に対応。
