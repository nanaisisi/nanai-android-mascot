# tooltipブレス記述例

- **規格**: [introduction_tooltipbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/tooltip-brace/introduction_tooltipbrace/) (ukadoc-spec/descript/shell-surfaces/tooltip-brace/introduction_tooltipbrace.md)
- **検索語**: tooltip
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/surface_alias.rs:85` `Head,Head tooltip`
- `src-tauri/src/tray.rs:33` `.tooltip("Nanai Android Mascot")`
- `ui/ts/surface/surface-collision.ts:311` `const tooltip = lowerMap.get(colLower);`
- `ui/windows/tauri-desktop.conf.json:169` `"tooltip": "Nanai Android Mascot Desktop"`
- `tests/touch/motion/snap.test.ts:77` `it("formats SSP snap tooltip text correctly for Monitor and Character", () => {`
- `crates/ui/src/surfaces/tests/parser_tests/syntax_blocks/surface_alias.rs:90` `assert_eq!(parsed_char.tooltips["char2"]["Head"], "Head tooltip");`
