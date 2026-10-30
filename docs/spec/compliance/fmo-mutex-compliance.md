# FMO / Mutex 規格対応仕様 (FMO / Mutex Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: FMO/Mutex](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **FMO/Mutex 規格**: [ukadoc-spec: fmo-mutex](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、Nanai Android Mascot における FMO（File Mapping Object）および Mutex によるベースウェア間プロセス通信・状態共有仕様の適合状態および実装方針を管理するためのものである。

---

## 1. FMO / Mutex 規格概要と Nanai 実装方針

FMO（File Mapping Object）および名前付き Mutex は、Windows 環境における伺かベースウェア（SSP, MATERIA, CROW等）の状態検知およびプロセス間共有メモリ（ゴースト情報、サーフィスID、HWND等）の読み取り規格である。

- **Nanai 実装方針**:
  - Nanai Android Mascot は Android クロスプラットフォームアプリとして動作するため、Windows 固有の Win32 Named FMO / Mutex ではなく、非同期 IPC やクロスプラットフォーム状態管理（Tauri Command / JSON State）を用いてゴースト情報管理をエミュレート。
  - Windows 環境におけるデスクトップ連携時の将来的な FMO 読み取り拡張の土台として本仕様書を統合。

---

## 2. 仕様項目・対応状況

| 規格カテゴリ / ファイル | 仕様・対象領域 | 対応状況 | 実装・備考 |
| :--- | :--- | :---: | :--- |
| **FMO / Mutex 概要** (`chapter0.md`) | Windows 依存性と他OS向け拡張 | ✅ 確認済 | クロスプラットフォーム向けエミュレート方針策定 |
| **Mutex** (`mutex.md`) | ベースウェア生存確認 ("ssp", "sakura") | ✅ 確認済 | プロセス生存監視の設計に反映 |
| **FMO** (`fmo.md`) | 64KB共有メモリ、キー値フォーマット (`path`, `name`, `surface` 等) | ✅ 確認済 | ゴースト状態管理レコードの設計に反映 |
| **FMO用Mutex** (`fmo-mutex.md`) | 排他制御 (`SakuraFMO` 等) | ✅ 確認済 | 同期制御の設計に反映 |
