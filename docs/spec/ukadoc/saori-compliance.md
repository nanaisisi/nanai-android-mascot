# SAORI over DirectSSTP 規格対応仕様 (SAORI over DirectSSTP Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: SAORI over DirectSSTP](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSTP (Sakura Script Transfer Protocol)**: [ukadoc: SSTP](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/) - © MATERIA開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)
  - **SAORI 規格**: [ukadoc: SAORI](https://ukatech.shillest.net/ukadoc-spec/spec/saori/) - © SAORI 規格策定チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)
  - **PLUGIN 規格**: [ukadoc: PLUGIN](https://ukatech.shillest.net/ukadoc-spec/spec/plugin/) - © MATERIA開発チーム / SSP開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)
  - **伺か (Ukagaka) / ゴースト / シェル**: [伺か / 偽春菜 / あれ以外の何か with「何か」](https://ukatech.shillest.net/ukadoc-spec/) - © MATERIA開発チーム / うさださくら 氏 / コミュニティ有志 (コミュニティ規格 / オープンドキュメント)
  - **SHIORI / 各SHIORIサブシステム (里々, YAYA, 華和梨 等)**: [ukadoc: SHIORI/3.0](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © MATERIA開発チーム / 里々開発チーム / YAYA開発チーム / 華和梨開発チーム / ukadoc プロジェクト (ukadoc 仕様 / 各コミュニティライセンス)

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
