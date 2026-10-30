# ukadoc-spec/memo (設計メモ・互換性ノート) 規格適合・対応確認文書 (Memo & Compatibility Compliance)

- **参照公式規格**: [ukatech/ukadoc-spec: memo](https://github.com/ukatech/ukadoc-spec/tree/main/memo)
- **権利表記**: © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
- **管理・検証規定**: [厳密コード検証システム規定 (Strict Code Verification Protocol)](../developer/strict-code-verification-system.md)

本ドキュメントは、`ukadoc-spec/memo/` 配下のメモ・互換性ノート（`memo.md`: ベースウェア機能比較・バナー仕様・互換性注意点、`shiori-event.md`: SHIORI Event 概説・GET/NOTIFY・Reference 体系）に対する Nanai Android Mascot の適合状態および設計方針をまとめた公式対応文書である。

---

## 1. `memo.md`（ベースウェア機能比較・互換性ノート）の対応方針

| 項目・トピック | 内容・仕様概要 | Nanai における実装・対応方針 |
| :--- | :--- | :--- |
| **ベースウェア機能比較** (MATERIA / SSP / CROW) | コンソール、時計合わせ、ヘッドライン、メール、プラグイン、更新、倍率、着せ替え等の差異 | Nanai は Android / デスクトップクロスプラットフォームとして、SSP 互換の豊富な機能（ネットワーク更新、ヘッドライン、マルチ起動、着せ替え、半透明バルーン等）を統合サポート。 |
| **おすすめサイトバナー** (`banner/`, `urllist`) | `*/ghost/master/banner/` にバナー画像を配置し urllist 形式で記述する仕様 | ゴーストアセット内のバナーフォルダスキャンおよびメニュー/モーダルでのバナー表示に対応。 |
| **互換に関する製作上の注意** | ゼロオリジン（メール・更新数）、サーフィス番号制限（MATERIA 8192）、PNA 透過制限、アニメーション速度、暗号化ファイル (`dft`/`dfp`等) | Rust VFS およびセキュアパーサー層にて、旧来の古い仕様差分（Shift_JIS / UTF-8、PNAマスク、大文字小文字のケースインセンシティブ解決）を吸収。 |
| **SSP 専用機能** | 32bit PNG 透過表示、CAB/自己解凍展開、`surfacetable.txt`, `surfaces2.txt`, `developer_options.txt` | `surfacetable.txt` パーサー (`surfacetable.rs`)、32bit PNG / PNA 合成コンポジタ、NAR/ZIP 展開機能を完備。 |

---

## 2. `shiori-event.md`（SHIORI Event 概説）の対応方針

| 項目・トピック | 内容・仕様概要 | Nanai における実装・対応方針 |
| :--- | :--- | :--- |
| **SHIORI Event の基本概念** | ベースウェアがトリガー（タイマーやマウス入力等）を発行し、SHIORI がさくらスクリプトを生成して返送する仕組み | `OnBoot`, `OnMouseClick`, `OnSecondChange` などのイベントを非同期 Web Worker および Rust FFI を通じて完璧にルーティング。 |
| **Reference 体系** | 0から始まる通し番号、一部不定数 (`Reference*`) の引数通知 | `ShioriRequest` モデルおよびプロトコルパーサーにて `Reference0` から `ReferenceN` までの可変引数を完全にサポート。 |
| **GET と NOTIFY コマンド** | 応答（さくらスクリプト）を期待する GET コマンドと、情報通知のみの NOTIFY コマンドの分離 | `send_shiori_request`（GET）および `send_shiori_notify`（NOTIFY）の 2 系統の通信パイプラインを実装済み。 |
