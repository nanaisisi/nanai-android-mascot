# HEADLINE/2.0 規格対応仕様 (HEADLINE/2.0 Compliance)

- **仕様リファレンス**: [ukatech/ukadoc-spec: HEADLINE/2.0](https://ukatech.shillest.net/ukadoc-spec/spec/headline/)
- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

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
