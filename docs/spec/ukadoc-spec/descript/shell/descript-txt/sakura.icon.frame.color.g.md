# sakura.icon.frame.color.g,数値

- **規格**: [sakura.icon.frame.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.icon.frame.color.g/) (ukadoc-spec/descript/shell/descript-txt/sakura.icon.frame.color.g.md)
- **検索語**: sakura.icon.frame.color.g
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_icon_frame_color_rgb()` において `sakura.icon.frame.color.g` キーのパースおよびアイコン枠色抽出が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:306` `let g = self.get("sakura.icon.frame.color.g")?.parse::<u8>().ok()?;`
