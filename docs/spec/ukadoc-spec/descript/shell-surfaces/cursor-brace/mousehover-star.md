# mousehover\*,当たり判定ID,ファイル名

- **規格**: [mousehover-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/mousehover-star/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/mousehover-star.md)
- **検索語**: mousehover
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/helpers/lines.rs:94` `} else if raw_event.starts_with("mousehover") {`
- `crates/nanai-surface/src/parser/helpers/lines.rs:95` `"mousehover"`
