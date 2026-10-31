## UKADOC 標準イベントとモバイル操作のマッピング仕様

[UKADOC SHIORI/3.0 Event](https://ssp.shillest.net/ukadoc/manual/spec_shiori3.html) に完全準拠したイベント送受信パイプラインを定義します。

| モバイル操作             | 送信 SHIORI イベント                 | ヘッダ・パラメータ仕様 (Reference)                                                                                                                                 | 動作・備考                                                 |
| :----------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **単発タップ（つつき）** | `OnMouseClick`                       | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0 (左クリック相当)`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID (head, bust等)` | `surfaces.txt` の Collision 矩形から逆算判定               |
| **スワイプ移動（なで）** | `OnMouseMove`                        | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID`                                 | 一定回数・距離のストローク検知で「なで」反応               |
| **長押し（600ms）**      | `OnMouseDoubleClick` または メニュー | `Reference4: 当たり判定ID`                                                                                                                                         | 部位固有のダブルクリック応答、または右クリックメニュー展開 |
| **定期タイマー**         | `OnSecondChange`                     | `Reference0: 起動時からの秒数`<br>`Reference1: 重複不可フラグ`<br>`Reference2: 最小化中フラグ (0/1)`                                                               | 自発トーク（ランダムトーク）周期駆動                       |
| **選択肢タップ**         | `OnChoiceSelect`                     | `Reference0: 選択肢ID` (`\q[ラベル,ID]`)                                                                                                                           | スクリプト対話分岐の進行                                   |
| **起動・終了**           | `OnBoot` / `OnClose`                 | `Reference0: シェル名`                                                                                                                                             | 起動挨拶、終了前トーク処理                                 |

---
