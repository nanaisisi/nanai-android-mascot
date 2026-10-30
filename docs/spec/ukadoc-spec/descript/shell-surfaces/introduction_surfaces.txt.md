# surfaces.txt

- **規格**: [introduction_surfaces.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt/) (ukadoc-spec/descript/shell-surfaces/introduction_surfaces.txt.md)
- **検索語**: surfaces.txt
- **対応状況**: ✅ 対応済 (surface-load.js)

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定・カーソル定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/shell/mod.rs:3` `//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）`
- `crates/ui/src/app.rs:50` `assert_eq!(extract_filename("assets/ghost/mock_nanai/surfaces.txt"), "surfaces.t`
- `crates/ui/src/app.rs:51` `assert_eq!(extract_filename("surfaces.txt"), "surfaces.txt");`
- `crates/ui/src/manifest.rs:20` `/// `surfaces.txt`の`name,` / surfacetable の表示名（無ければ None）`
- `crates/ui/src/manifest.rs:101` `dir.join("surfaces.txt"),`
