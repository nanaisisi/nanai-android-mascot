# FMO / Mutex 規格対応仕様 (FMO & Mutex Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: FMO/Mutex](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **SSTP (Sakura Script Transfer Protocol)**: [ukadoc-spec: sstp](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **FMO / Mutex 規格**: [ukadoc-spec: fmo-mutex](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

- **インターフェース**: Windows File Mapping Object (FMO), 名前付きミューテックス, プロセス間排他
- **対応ステータス**: **設計・一部実装（50%）**

---

## 1. 規格概要と Nanai 実装方針

FMO (File Mapping Object) と Mutex は、Windows 上で起動中のベースウェアやゴーストの情報を共有メモリ上に公開し、ゴースト間の二重起動防止や SSTP 送信先検出を行うための規格です。

- **Windows 環境**:
  - `Sakura` / `SSP` 等の標準 FMO 形式（共有メモリ `\Sakura`）の読取・登録に対応可能。
  - 多重起動防止用 Named Mutex のハンドリング。
- **Android / Web 環境**:
  - OS レベルの Windows FMO は存在しないため、メモリ内 Virtual FMO（アプリ内状態レジストリ）および LocalStorage / SQLite による代替管理。
  - アプリ内マルチゴースト状態の統合管理。

---

## 2. 規格項目対応状況

| 項目 | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| **名前付き Mutex** | 二重起動排他制御 | ✅ 対応済 | Tauri / OS 側のシングルインスタンス制御 |
| **FMO (`\Sakura`)** | 起動中ゴースト一覧 | 🚧 開発中 | Windows では共有メモリ参照、Android では内蔵レジストリ |
| **FMO フィールド** | `name`, `hwnd`, `ghostpath` 等 | 🚧 開発中 | ゴースト情報エントリの保持・参照 |
| **DirectSSTP 宛先特定** | HWND 取得 | 🚧 開発中 | ウィンドウハンドル連携（Windows） / 内部イベントバス連携（Android） |
