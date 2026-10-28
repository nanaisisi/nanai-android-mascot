# ukadoc-spec/spec (コアプロトコル仕様: SHIORI/3.0, さくらスクリプト, バルーン) 規格適合確認文書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/spec**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における、ukadoc-spec の `spec/` ディレクトリ（SHIORI/3.0, さくらスクリプト, バルーンのコアプロトコル仕様）に対する適合確認文書である。

---

## 1. spec 配下のコアプロトコル別適合状況

| 規格カテゴリ (`spec/`) | 対象コアプロトコル・仕様 | 対応度 | Nanai における実装・対応内容 |
| :--- | :--- | :---: | :--- |
| **SHIORI/3.0 コア** (`spec/shiori3/`) | リクエスト/レスポンスヘッダ、ステータスコード (`200 OK`, `204 No Content`, `400`, `500`) | **95%** | `ShioriRequest` / `ShioriResponse` パーサー、非同期 Web Worker、ネイティブ DLL/SO 連携。 |
| **さくらスクリプト仕様** (`spec/sakura-script/`) | スコープ、サーフィス変更、ウェイト、選択肢、アンカー、フォント属性、タイムクリティカル | **96%** | `crates/ui/src/script/` パーサおよび Canvas 2D / DOM 再生エンジン。 |
| **バルーン仕様** (`spec/balloon/`) | 独立バルーン、フォント設定、有効矩形、折り返し点、原点オフセット | **90%** | CSS 変数および DOM への `descript.txt` 動的反映、バルーン倍率変更 (`50%`〜`200%`)。 |
