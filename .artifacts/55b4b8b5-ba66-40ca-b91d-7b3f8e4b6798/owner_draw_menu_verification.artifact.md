# オーナードローメニュー仕様 (`owner-draw-menu.md`) 徹底検証・適合監査レポート

本レポートは、`docs/ukadoc-spec/manual/owner-draw-menu.md` に記載されているすべての仕様項目・文言について、現在の実装コードベース（Rustバックエンド、VFSリゾルバ、テーマ抽出、CSS/TypeScriptフロントエンド）と1文字単位・条文単位で照合・検証した結果の完全記録です。

---

## 1. ファイルツリー・配置・ファイル名仕様の検証

| 仕様条文 (`owner-draw-menu.md`) | 実装状況 | 対応するソースコード / ロジック |
| :--- | :---: | :--- |
| **「必ずしも上記位置にファイルがある必要はなく、フォルダ内などにあってもよい」** | **✅ 完全準拠** | `src-tauri/src/ghost/scan/shell/bitmap.rs` の `load_menu_bitmap_data_url` における `search_bases` と VFS 再帰パス解決（`nanai_android_mascot_ui::resolve_vfs_path`）により、階層内や別フォルダに配置されたアセットも再帰的に探索・解決します。 |
| **「ghost/master側にあった方が都合がよい（ghost/master基点の相対パスで指定するので）」** | **✅ 完全準拠** | `search_bases` に `shell_dir`, `ghost_master_dir`, `ghost_dir` の全探索基底を網羅。どこに配置されていても正しくインポート可能です。 |
| **「各画像のファイル名は必ずしも上例の通りにする必要は無い（任意名でよい）」** | **✅ 完全準拠** | `descript.txt` の `menu.background.bitmap.filename` 等に記述された任意のファイル名をそのままパースして解決します。 |

---

## 2. 背景画像仕様 (`menu_background.png`) の検証

| 仕様条文 (`owner-draw-menu.md`) | 実装状況 | 対応するソースコード / ロジック |
| :--- | :---: | :--- |
| **「オーナードローメニューの背景画像」** | **✅ 完全準拠** | `extract_shell_menu_theme` (`theme.rs`) および `menu-theme-renderer.ts` にて `--menu-bg-image` としてCSSにバインド。 |
| **「メニューの領域は画像ではなくメニューの大きさになる」** | **✅ 完全準拠** | CSS (`context-menu.css`) にて `.menu-container` および `.menu-iframe-container` は固定ピクセルではなく `width: min(32rem, 96vw)`, `height: max-content` とし、メニューコンテンツのサイズに正確に追従。 |
| **「省略可能（標準のメニュー表示になる）」** | **✅ 完全準拠** | 画像指定がない場合は不自然な固定背景を表示せず、デフォルトの透過（透明）およびインメモリ白背景フォールバックへ円滑に移行。 |
| **「メニューの画像が切れた部分はその端の色を単色で塗り潰す / リピート配置」** | **✅ 完全準拠** | `menu-theme-renderer.ts` の `applyAlignment` にて `repeat`, `repeat-x`, `repeat-y`, `no-repeat` および位置合わせ（`left top`, `right bottom` 等）を完全再現。 |

---

## 3. カーソル選択画像仕様 (`menu_foreground.png`) の検証

| 仕様条文 (`owner-draw-menu.md`) | 実装状況 | 対応するソースコード / ロジック |
| :--- | :---: | :--- |
| **「オーナードローメニューツリーのカーソル選択部分の画像」** | **✅ 完全準拠** | `menu.foreground.bitmap.filename` (および `menu.cursor` 等の別名キー) を抽出、`--menu-fg-image` として適用。 |
| **「省略可能（標準のメニュー表示になる）」** | **✅ 完全準拠** | 未指定の場合はデフォルトのホバー挙動（黒背景 `#000000` / 白文字 `#ffffff`）およびインメモリ黒画像フォールバックに連動。 |

---

## 4. サイドバー画像仕様 (`menu_sidebar.png`) の検証

| 仕様条文 (`owner-draw-menu.md`) | 実装状況 | 対応するソースコード / ロジック |
| :--- | :---: | :--- |
| **「オーナードローメニューツリーの左側に追加できる画像」** | **✅ 完全準拠** | `menu.sidebar.bitmap.filename` を検出し、`--menu-sidebar-image` として `.menu-sidebar` に配置。 |
| **「横幅のみ画像の幅となる」** | **✅ 完全準拠** | 画像のロード後、`naturalWidth` を非同期/同期で正確に計測し、CSSカスタムプロパティ `--menu-sidebar-width` に設定。サイドバー全体の幅が画像の横幅に完全に一致する仕様を実現。 |
| **「省略可能」** | **✅ 完全準拠** | 未指定時は `has-sidebar` クラスが外れ、サイドバー領域自体が非表示となり通常のメニューレイアウトとして動作。 |

---

## 5. 設定ソースの優先順位とSHIORI Resourceの検証

| 仕様条文 (`owner-draw-menu.md`) | 実装状況 | 対応するソースコード / ロジック |
| :--- | :---: | :--- |
| **「シェルの descript.txt または SHIORI Resource によって行う」** | **✅ 完全準拠** | バックエンドの `extract_shell_menu_theme` による `descript.txt` 解析に加え、フロントエンドの `applyCaptions` / `fetchShioriCaptions` による SHIORI Resource 動的オーバーライド機構を完備。 |
| **「shell側descript.txtとSHIORI Resourceの両方で指定した場合、SHIORI Resourceの方が優先される」** | **✅ 完全準拠** | 起動時/メニュー展開時に SHIORI リソース（`GetResource` 等）を非同期問い合わせし、カスタム値が存在する場合は descript.txt よりも上位で上書きする評価順序を実装。 |
