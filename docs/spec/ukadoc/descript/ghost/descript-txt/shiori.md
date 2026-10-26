# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/shiori/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/ui/templates/doc-templates.js:84` `<a href="https://github.com/YAYA-shiori/yaya-docs" target="_blank" rel="noopener noreferre`
- `ui/js/ui/templates/doc-templates.js:112` `<h4>YAYA (yaya-shiori) - 修正 BSD ライセンス (BSD 3-Clause License)</h4>`
- `src-tauri/src/commands/shiori/status.rs:22` `pub async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> `
- `src-tauri/src/commands/shiori/status.rs:23` `Ok(state.shiori_engine.lock().is_some())`
- `ui/js/ghost/ghost.js:4` `import { ghostShioriMethods } from "./ghost-shiori.js";`
