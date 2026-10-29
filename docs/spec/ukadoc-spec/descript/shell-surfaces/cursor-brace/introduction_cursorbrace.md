# cursorブレス記述例

- **規格**: [introduction_cursorbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace.md)
- **検索語**: cursor
- **対応状況**: ✅ 対応済 (surface-load.js)\n\n## 突合結果\n\nui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。\n\n## 実装箇所\n\n- ui/js/surface/surface-load.js // [surfaces.txt], [surface.alias], [surface], [descript] 等のブレース構文

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `ui/css/character.css:27` `cursor: grab;`
- `ui/css/character.css:31` `cursor: grabbing;`
- `ui/css/base.css:66` `cursor: pointer;`
- `ui/css/base.css:104` `cursor: text;`
- `ui/css/mascot.css:54` `cursor: grab;`
