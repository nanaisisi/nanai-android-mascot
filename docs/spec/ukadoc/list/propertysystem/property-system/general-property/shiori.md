# shiori.変数名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/shiori/)
- **検索語**: shiori.
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「shiori.」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/ghost.js:4`  `import { ghostShioriMethods } from "./ghost-shiori.js";`
- `ui/js/ghost/ghost.js:8` (コメント) `* (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)`
- `src-tauri/src/commands/shiori/lifecycle.rs:44`  `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle.rs:50`  `candidates.push(ghost_master_dir.join("shiori.so"));`
- `src-tauri/src/commands/shiori/lifecycle.rs:126`  `candidates.push(ghost_master_dir.join("shiori.dll"));`
