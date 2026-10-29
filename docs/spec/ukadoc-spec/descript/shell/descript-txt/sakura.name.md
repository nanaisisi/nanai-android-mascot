# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.name/) (ukadoc-spec/descript/shell/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:237` `.and_then(|m| m.get("sakura.name").cloned());`
- `src-tauri/src/ghost/scan/directory.rs:81` `.and_then(|m| m.get("sakura.name").cloned());`
- `crates/ui/src/descript.rs:90` `/// キャラクター本体名（`kero.name` または `sakura.name`）`
- `crates/ui/src/descript.rs:92` `self.get("sakura.name")`
- `crates/ui/src/descript.rs:145` `/// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）`
