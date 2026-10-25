# Web関連規格対応仕様 (Web & Network Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: Web関連](https://ukatech.shillest.net/ukadoc-spec/spec/web/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

- **インターフェース**: NAR インストール, `updates2.dau`, ネットワーク更新, Web 連携
- **対応ステータス**: **設計・一部実装（65%）**

---

## 1. 規格概要と Nanai 実装方針

伺かの Web 関連規格は、Web ブラウザからのワンクリックゴーストインストール（NAR ダウンロード・展開）、およびオンライン経由でのファイル差分更新（ネットワーク更新）を定義しています。

- **Nanai 実装方針**:
  - **NAR インストール**:
    - ブラウザからのドラッグ＆ドロップ、またはファイル選択ダイアログによる `.nar` ファイルの自動認識・展開。
    - Android インテント連携による NAR ファイルのワンタップ導入。
  - **ネットワーク更新 (`updates2.dau` / `updates.txt`)**:
    - Rust / Web 標準 Fetch API による差分 MD5 / ハッシュ比較とダウンロード。
    - Git 管理外の安全なユーザーデータディレクトリ（`userData/` / `assets/ghost/`）への安全な書き込み。
  - **セキュリティ**:
    - CSP (Content Security Policy) と Tauri スコープ制御による任意コード実行防止。

---

## 2. Web 関連機能対応状況

| 項目 | 対象仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| **NAR インストール** | `.nar` (ZIP準拠アーカイブ) | 🚧 開発中 | ドラッグ＆ドロップおよびファイルインポートUI接続 |
| **ネットワーク更新** | `updates2.dau` (MD5差分リスト) | 🚧 開発中 | オンラインファイルハッシュ検証・差分ダウンロード |
| **外部 URL オープン** | おすすめ・ポータルサイト | ✅ 対応済 | Windows ではデフォルトブラウザ、Android では Intent (`ACTION_VIEW`) 起動 |
| **文字コード透過** | Web 上の Shift_JIS コンテンツ | ✅ 対応済 | `encoding_rs` による自動判別・UTF-8 デコード |
