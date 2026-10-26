# shiori.変数名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/shiori/)
- **検索語**: shiori.
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「shiori.」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/ghost/ghost.js:4`  `import { ghostShioriMethods } from "./ghost-shiori.js";`
- `ui/js/ghost/ghost.js:8` (コメント) `* (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)`
- `src-tauri/src/commands/shiori/lifecycle.rs:44`  `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle.rs:50`  `candidates.push(ghost_master_dir.join("shiori.so"));`
- `src-tauri/src/commands/shiori/lifecycle.rs:126`  `candidates.push(ghost_master_dir.join("shiori.dll"));`
