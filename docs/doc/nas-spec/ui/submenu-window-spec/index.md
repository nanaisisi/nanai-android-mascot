# 独立サブメニューウィンドウ設計・実装仕様書 (submenu-window-spec)
- **規格**: [submenu-window-spec.md](submenu-window-spec.md)
- **検索語**: show_submenu_window
- **対応状況**: ✅ 対応済


- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本ドキュメントは、**nanai-android-mascot** におけるデスクトップ環境での「独立サブメニューウィンドウ（`submenu_window`）」のアーキテクチャ、画面座標吸着計算、IPC連携、および段階的実装計画を定義します。

---
