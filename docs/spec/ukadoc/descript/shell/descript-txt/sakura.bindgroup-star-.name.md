# sakura.bindgroup\*.name,カテゴリ名,パーツ名,サムネイル名

- **規格**: [sakura.bindgroup-star-.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.name/) (ukadoc-spec/descript/shell/descript-txt/sakura.bindgroup-star-.name.md)
- **検索語**: sakura.bindgroup
- **対応状況**: ✅ 実装済 (Rust `crates/ui/src/descript.rs` Descript 解析 / `crates/ui/src/shell.rs` Shell::load)

## 突合結果

実装コードに「sakura.bindgroup」が見つからない。

## 実装箇所

- Rust: `crates/ui/src/descript.rs` (bind_groups / bindoption_group → ShellManifest bindgroup 情報)
- Rust: `crates/ui/src/manifest.rs` (Shell::manifest → sakura_bind_groups / kero_bind_groups)
- JS: `ui/js/surface/bind-menu.js` (bindMenuData / seedDressupDefaults = マニフェスト消費)
- JS: `ui/js/surface/surface.js` (applyShellManifest → bindgroup default 初期装着シード、activeBindLayers = 装着 bind アニメーションの常時合成)
- JS: `ui/js/ui/menu-submenu-renderer.js` + `ui/js/ui/context-menu.js` + `ui/js/ui/submenu.js` (着せ替えメニュー描画)
- JS: `ui/js/core/app-actions.js` (handleDressupToggle = mustselect/multiple 判定と bindDressup)
