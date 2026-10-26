# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/shiori/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「shiori」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ui/templates/doc-templates.js:84`  `<a href="https://github.com/YAYA-shiori/yaya-docs" target="_blank" rel="noopener noreferre`
- `ui/js/ui/templates/doc-templates.js:112`  `<h4>YAYA (yaya-shiori) - 修正 BSD ライセンス (BSD 3-Clause License)</h4>`
- `src-tauri/src/commands/shiori/status.rs:22`  `pub async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> `
- `src-tauri/src/commands/shiori/status.rs:23`  `Ok(state.shiori_engine.lock().is_some())`
- `ui/js/ghost/ghost.js:4`  `import { ghostShioriMethods } from "./ghost-shiori.js";`
