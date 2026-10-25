# VFS・エンコーディング・アーカイブ規格対応仕様 (VFS & Archive Compliance)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

Nanai Android Mascot における「ファイルシステム（仮想パス・大文字小文字吸収）」、「文字コード（Shift_JIS/UTF-8）」、および「NAR アーカイブ」規格への個別対応仕様です。

## 1. 概要と対応度

- **規格**: Shift_JIS (CP932) / UTF-8、大文字小文字区別なしパス、NAR (ZIP)
- **対応度**: **80%**
- **主要実装ファイル**:
  - `src-tauri/src/lib.rs`: `encoding_rs` によるエンコード変換、大文字小文字吸収 VFS
  - `docs/spec/ghost-import-and-asset-separation-spec.md`: アセット分離仕様
  - `docs/spec/encoding-and-vfs-spec.md`: VFS詳細仕様

---

## 2. 仕様対応詳細

| 項目 / 規格 | 対象仕様 | 対応状況 | 動作仕様・実装詳細 |
| :--- | :--- | :---: | :--- |
| **文字コード自動判別** | Shift_JIS (CP932) / UTF-8 / EUC-JP | ✅ 対応済 | `encoding_rs` を用いた Rust 側でのバイト列自動判別と透過 UTF-8 変換 |
| **仮想ファイルシステム (VFS)** | 大文字・小文字表記揺れ吸収 | ✅ 対応済 | Windows (大文字小文字区別なし) と Android/Linux (区別あり) の差異を Rust 側の正規化パス解決で透過的に吸収 |
| **アセット分離設計** | `assets/ghost/`, `assets/balloon/`, `userData/` | ✅ 対応済 | 初期同梱アセット（Git追跡）とユーザー導入アセット（Git除外・端末ローカル保存）の完全分離 |
| **NAR アーカイブ展開** | `.nar` (ZIP準拠) の解凍・導入 | 🚧 開発中 | ドラッグ＆ドロップまたはファイルインポートによる自動解凍・VFS配置 |
| **`descript.txt` パース** | `charset,Shift_JIS` 等 | ✅ 対応済 | 定義ファイルのヘッダ文字コード指定および行単位パース |

---

## 3. クロスプラットフォーム対応

- **パスセパレータ吸収**: `/` および `\` の混在を Rust 側で正規化。
- **モバイル保護領域**: Android のアプリアンインストール時にユーザー導入ゴーストが安全に保護・管理されるパス構成を担保。
