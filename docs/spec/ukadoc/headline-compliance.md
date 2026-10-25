# HEADLINE/2.0 規格対応仕様 (HEADLINE/2.0 Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: HEADLINE/2.0](https://ukatech.shillest.net/ukadoc-spec/spec/headline/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 互換拡張 / ポップアップメニュー規格**: [SSP BUG-SLIK-PRACTICE / 仕様リファレンス](http://ssp.shillest.net/) - © PONapook 氏 / SSP開発チーム (SSP リファレンス仕様)
  - **伺か (Ukagaka) / ゴースト / シェル**: [伺か / 偽春菜 / あれ以外の何か with「何か」](https://ukatech.shillest.net/ukadoc-spec/) - © MATERIA開発チーム / うさださくら 氏 / コミュニティ有志 (コミュニティ規格 / オープンドキュメント)
  - **さくらスクリプト (Sakura Script)**: [ukadoc: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © MATERIA開発チーム / SSP開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)
  - **SHIORI / 各SHIORIサブシステム (里々, YAYA, 華和梨 等)**: [ukadoc: SHIORI/3.0](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © MATERIA開発チーム / 里々開発チーム / YAYA開発チーム / 華和梨開発チーム / ukadoc プロジェクト (ukadoc 仕様 / 各コミュニティライセンス)
  - **バルーン仕様 (Balloon)**: [ukadoc: surfaces.txt / balloon](https://ukatech.shillest.net/ukadoc-spec/) - © MATERIA開発チーム / SSP開発チーム / ukadoc プロジェクト (ukadoc 仕様 / パブリックリファレンス)

- **プロトコル**: HEADLINE/2.0 (DLL / WebSensor)
- **対応ステータス**: **設計・一部実装（40%）**

---

## 1. 規格概要と Nanai 実装方針

HEADLINE は、ニュースサイトやブログ等の Web サイトからヘッドライン（見出し一覧・記事リンク）を取得し、ゴーストに喋らせるためのセンサモジュール規格です。

- **Nanai 実装方針**:
  - レガシーな DLL 型ヘッドラインセンサに代わり、現代の Web 標準 `Fetch API` + RSS/Atom パーサーを活用。
  - 右クリックメニューの「ヘッドライン/ニュース (H)」からのトリガー連携を実装。
  - 取得したヘッドライン情報をさくらスクリプト形式（`\q[記事見出し,URL]`）でバルーンへ整形出力。

---

## 2. コマンド・インターフェース対応状況

| 項目 | 仕様 | 対応状況 | 動作仕様・備考 |
| :--- | :--- | :---: | :--- |
| `load` | 初期化 | 🚧 開発中 | センサ初期化 |
| `unload` | 解放 | 🚧 開発中 | リソース解放 |
| `request` | ヘッドライン取得要求 | 🚧 開発中 | URL への HTTP GET 発行と見出し抽出 |
| `OnHeadline` イベント | SHIORI 連携 | 🚧 開発中 | 取得結果・エラーを SHIORI へ通知しスクリプト化 |
