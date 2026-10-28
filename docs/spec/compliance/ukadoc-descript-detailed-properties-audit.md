# ukadoc-spec/descript 詳細プロパティ仕様・実装監査レポート (Descript Detailed Properties Audit)

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **ukadoc-spec/descript**: [ukatech/ukadoc-spec](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本監査レポートは、`docs/spec/ukadoc/descript/`（バルーン、ゴースト、シェル、プラグイン、ヘッドライン、インストール等における数百に及ぶ詳細な descript プロパティ仕様ファイル群）と、Nanai Android Mascot のバックエンド/フロントエンド実装における実際の対応状態を詳細に突き合わせたものである。

---

## 1. バルーン `descript.txt` 詳細プロパティ対応表 (`descript/balloon/descript-txt/`)

| プロパティカテゴリ       | 代表的なプロパティ名                                                     |   実装状態   | Nanai Android Mascot における実装・適用箇所                                                                             |
| :----------------------- | :----------------------------------------------------------------------- | :----------: | :---------------------------------------------------------------------------------------------------------------------- |
| **フォント設定**         | `font.name`, `font.height`, `font.color.*`, `font.bold`, `font.italic`   | **完全対応** | `app-actions.js` (`applyBalloonDescript`), CSS 変数 (`--balloon-font-family`, `--balloon-text-color` 等) への動的反映。 |
| **有効矩形・パディング** | `validrect.left`, `validrect.top`, `validrect.right`, `validrect.bottom` | **完全対応** | `app-actions.js` にて `validrect` の各余白をバルーン DOM (`.balloon`) のパディングへ動的適用。                          |
| **原点・折り返し**       | `origin.x`, `origin.y`, `wordwrappoint.x`                                | **完全対応** | バルーンのオフセット位置 (`left`/`top`) および最大幅 (`max-width`) への動的バインド。                                   |
| **カーソル・リンク**     | `cursor.*`, `anchor.*`                                                   | **部分対応** | 選択肢ボタン (`\q`) およびアンカーリンク (`\_a`) のハイライト色・背景色の CSS 変数連携。                                |

---

## 2. ゴースト・シェル `descript.txt` 詳細プロパティ対応表 (`descript/ghost/`, `descript/shell/`)

| プロパティカテゴリ         | 代表的なプロパティ名                                                                                 |   実装状態   | Nanai Android Mascot における実装・適用箇所                                                                                   |
| :------------------------- | :--------------------------------------------------------------------------------------------------- | :----------: | :---------------------------------------------------------------------------------------------------------------------------- |
| **基本情報**               | `name`, `version`, `craftman`, `craftmanurl`, `type`                                                 | **完全対応** | `src-tauri/src/ghost/scan/mod.rs` および `descript.rs` にて Shift_JIS/UTF-8 両対応で完全パース。エクスプローラ表示に活用。    |
| **スコープ名称**           | `sakura.name`, `kero.name`, `sakura.defaultleft` 等                                                  | **完全対応** | ゴーストのメイン（\0）および相方（\1）の識別名取得、初期配置座標の解釈。                                                      |
| **SHIORI 指定**            | `shiori` (例: `satori.dll`, `yaya.dll`)                                                              | **完全対応** | `lifecycle.rs` にて `shiori` キー指定を最優先探索し、DLL / .so を VFS ケースインセンシティブにロード。                        |
| **オーナードローメニュー** | `menu.background.bitmap.filename`, `menu.sidebar.bitmap.filename`, `menu.foreground.bitmap.filename` | **完全対応** | `shell.rs` にて配色・ビットマップを抽出、`submenu.js` (`applyShellMenuTheme`) で Tauri の `convertFileSrc` 経由セキュア適用。 |

---

## 3. インストール設定ファイル群対応表 (`descript/install/`)

| 設定ファイル                | 対象プロパティ・仕様                                                            |   実装状態   | Nanai Android Mascot における実装・適用箇所                                                                                   |
| :-------------------------- | :------------------------------------------------------------------------------ | :----------: | :---------------------------------------------------------------------------------------------------------------------------- |
| **`install.txt`**           | `name`, `type` (`ghost`, `balloon`, `shell`, `plugin`, `headline`), `directory` | **完全対応** | `src-tauri/src/commands/install.rs` にて NAR / ZIP アーカイブ展開時に自動パースし、適切なアセットフォルダへ自動振り分け配置。 |
| **`delete.txt`**            | 削除時除外・指定ファイル群                                                      | **部分対応** | ゴーストアンインストール時のディレクトリ再帰削除 (`uninstall_ghost`)。                                                        |
| **`developer_options.txt`** | 開発者オプション                                                                | **部分対応** | 開発環境の管理および `.dev_ignore` 制御等。                                                                                   |
| **`updates_def.txt`**       | ネットワーク更新定義                                                            | **完全対応** | `updates2.dau` およびネットワーク更新パイプライン。                                                                           |
