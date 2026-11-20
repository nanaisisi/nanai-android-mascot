# sakura.icon.frame.color.r,数値

- **規格**: [sakura.icon.frame.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.icon.frame.color.r/) (ukadoc-spec/descript/shell/descript-txt/sakura.icon.frame.color.r.md)
- **検索語**: sakura.icon.frame.color.r
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_icon_frame_color_rgb()` において `sakura.icon.frame.color.r` キーのパースおよびアイコン枠色抽出が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:303` `/// [sakura.icon.frame.color.r/g/b,数値]: Sakura 側アイコン枠色 (RGB)`
- `crates/nanai-core/src/descript_parser/types.rs:305` `let r = self.get("sakura.icon.frame.color.r")?.parse::<u8>().ok()?;`
