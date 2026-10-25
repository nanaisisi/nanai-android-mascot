# SAORI over DirectSSTP 規格対応仕様 (SAORI over DirectSSTP Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SAORI over DirectSSTP](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/)
- **プロトコル**: SAORI-basic (DLL) / SAORI-universal (DirectSSTP)
- **対応ステータス**: **設計・一部実装（40%）**

---

## 1. 規格概要と Nanai 実装方針

SAORI (Sakura Auxiliary Operator for Request Interruption) は、ゴースト（SHIORI）から呼び出される外部機能拡張モジュール（外部計算、Webアクセス、システム情報取得等）です。

- **DirectSSTP 経由の実行 (SAORI-universal)**:
  - プロセス間通信（DirectSSTP リクエスト/レスポンス）を用いて外部プロセスを SAORI として実行。
- **現代的 Web プラットフォーム適応**:
  - WebAssembly (WASM) SAORI: ブラウザ/Worker 内で完全安全・高速に実行。
  - JS Plugin/Fetch SAORI: Web 標準 API を活用した HTTP/JSON 連携。

---

## 2. コマンド・リクエスト仕様

| リクエスト項目 | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| `EXECUTE SSTP/1.1` | DirectSSTP メソッド | 🚧 開発中 | `SecurityLevel: External` / `Charset: UTF-8` |
| `Command: [SAORI-Name]` | 呼び出し対象モジュール | 🚧 開発中 | 登録済み WASM / ネイティブ SAORI の特定 |
| `Argument0` .. `n` | 引数リスト | 🚧 開発中 | SHIORI から渡された引数配列のマーシャリング |
| `Result` / `Value0` .. `n` | 戻り値レスポンス | 🚧 開発中 | 実行結果を SHIORI へ返却 |
