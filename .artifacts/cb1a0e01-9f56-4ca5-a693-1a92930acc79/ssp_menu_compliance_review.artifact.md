# SSP メニュー仕様適合性再確認レポート (SSP Menu Specification Compliance Review)

ukadoc-spec および SSP（Sakura Script Player）のオーナードローメニュー仕様に基づき、現在の実装 (`ui/menu-iframe.html`, `ui/css/context-menu.css`, `ui/ts/ui/`) の適合性を再確認しました。

---

## 1. 適合項目・仕様マッピング

| SSP メニュー項目 / 仕様要件                                 | 実装対応状況 (`ui/menu-iframe.html` / `context-menu.ts`)                | 備考・仕様準拠状況                                                            |
| :---------------------------------------------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **ゴースト側/標準メニュー階層**                             | 実装済み (`talk-btn`, `autotalk-btn`, `biff-btn`, `headlines-btn` 等)   | ukadoc-spec 準拠の標準機能順序                                                |
| **サブシステム切替 (着せ替え・シェル・ゴースト・バルーン)** | 実装済み (`dressup-btn`, `shell-btn`, `ghost-btn`, `balloon-btn`)       | サブメニュー連動対応                                                          |
| **ネットワーク更新・取込・アンインストール**                | 実装済み (`update-btn`, `export-btn`, `uninstall-btn`)                  | 管理アクション完備                                                            |
| **システムパネル・設定・開発者パネル**                      | 実装済み (`config-btn`, `dev-btn`, `readme-btn`, `inquire-btn`)         | デバッグ・設定機能統合                                                        |
| **終了・全終了・最小化**                                    | 実装済み (`minimize-btn`, `close-btn`, `close-all-btn`)                 | ウィンドウライフサイクル制御                                                  |
| **ビジュアルスキン (Sidebar & Background Bitmap)**          | 実装済み (`.menu-sidebar`, `.menu-container`, `menu-theme-renderer.ts`) | `sidebar_bitmap`, `background_bitmap` 動的反映                                |
| **透過背景 & スクロールなしジャストフィット**               | 実装済み (`background: transparent`, `overflow-y: hidden`)              | アイボリー等の不要なデフォルト背景を廃止し、SSPのオーナードロー透過挙動を再現 |

---

## 2. デザイン・レイアウトの SSP 準拠ポイント

1. **完全透過デフォルト**:
   - スキン画像（`menu.png` / `menu_bg.png`）が提供されない環境や読み込み前においても、無地の不自然な背景ボックス（アイボリー等）を表示せず、完全透過（`transparent`）で描画。
2. **サイドバー（Sidebar Bitmap）の動的追従**:
   - シェルの `descript.txt`（`menu_theme`）に定義された `sidebar_bitmap` や `sidebar_alignment` を検出し、左端に縦リピート（`repeat-y`）配置。
3. **スクロールバー排除のコンパクトフィット**:
   - メニュー全体およびサイドバー・ボタン配置を縦幅内にきれいに収め、余分なパディングやスクロール発生を排除。
