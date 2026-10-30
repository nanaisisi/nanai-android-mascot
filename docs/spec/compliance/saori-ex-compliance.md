# SAORI-EX 規格対応仕様 (SAORI-EX Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SAORI-EX](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SAORI-EX 規格**: [ukadoc-spec: saori-ex](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、Nanai Android Mascot における SAORI-EX 規格（内部拡張モジュール群、非同期実行、暗号化・ファイル操作・JWT・時間計算等の組み込みモジュール）の適合状態および実装方針を管理するためのものである。

---

## 1. SAORI-EX 規格概要と Nanai 実装方針

SAORI-EX は、従来の SAORI/1.0 仕様を拡張し、暗号処理、ファイル操作、JWT 検証、乱数生成、時間計算、データ変換などの豊富な内部モジュール (`internal_crypto`, `internal_file`, `internal_jwt`, `internal_time`, `internal_random`, `internal_system`, `internal_text`, `internal_data`) および非同期実行 (`async.md`) を提供するコミュニティ拡張規格である。

- **Nanai 実装方針**:
  - `src-tauri/src/shiori/saori.rs` において、SAORI/1.0 互換の非同期実行 (`execute_saori`) および組み込みモジュールの拡張スタブ・ロジックを統合。
  - 将来的な完全拡張モジュール（暗号・JWT等）のRustエコシステム（`ring`, `base64`, `jsonwebtoken` 等）連携の基盤を確立。

---

## 2. モジュール・インターフェース対応状況

| カテゴリ / 規格ファイル | 仕様・対象領域 | 対応状況 | 実装コード・備考 |
| :--- | :--- | :---: | :--- |
| **SAORI/1.0 基本** (`saori.md`, `chapter0.md`) | リクエスト/レスポンス、引数受付 | ✅ 対応済 | `src-tauri/src/shiori/saori.rs` (`execute_saori`) |
| **非同期実行** (`async.md`) | 非同期リクエスト処理 | ✅ 対応済 | Rust `async fn` コマンドとして非同期対応 |
| **内部モジュール** (`internal.md`, `internal_crypto/`, `internal_file/`, `internal_jwt/`, `internal_time/`, `internal_random/`, `internal_system/`, `internal_text/`, `internal_data/`) | 暗号・ファイル・JWT・時間・乱数等の内蔵ユーティリティ | 🚧 設計・一部実装 | 拡張スタブおよび `saori.rs` によるフォールバック |
| **DirectSSTP** (`directsstp.md`) | ダイレクトSSTP送信 | ✅ 対応済 | SSTP ブリッジモジュール群と連携 |
| **Sender / Compat** (`sender.md`, `compat.md`) | 送信元制御・互換性維持 | ✅ 対応済 | ヘッダーおよび互換レスポンス制御 |
