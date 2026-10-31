# 文字コード変換（Shift_JIS ↔ UTF-8）& 仮想ファイルシステム（VFS）仕様書
- **規格**: [encoding-and-vfs-spec.md](encoding-and-vfs-spec.md)
- **検索語**: resolve_vfs_path
- **対応状況**: ✅ 実装済


- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本仕様書は、**nanai-android-mascot** において、歴史的な伺かゴースト資産（Shift_JIS/CP932）をモダンな UTF-8 環境（Rust / Tauri / Web / Android）で文字化けなく読み込み、また OS ごとのファイルパス差異（大文字・小文字、区切り文字）を吸収する **仮想ファイルシステム（Virtual File System: VFS）** の仕様を定義します。

---
