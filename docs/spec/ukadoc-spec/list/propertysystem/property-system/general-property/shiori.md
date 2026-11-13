# shiori.変数名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/shiori/)
- **検索語**: shiori.
- **対応状況**: ✅ 実装済

## 突合結果

ヒットしたのは一般的な語「shiori.」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:30` `self.get("shiori").or_else(|| self.get("shiori.dll"))`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:60` `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `ui/ts/ghost/ghost-shiori.ts:2` `* @file ghost-shiori.ts`
- `tests/command-handler-system.test.ts:5` `import "./command-handler-system/shiori.test.js";`
- `crates/nanai-core/src/descript_parser.rs:63` `/// SHIORI バージョン (`shiori.version`)`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:73` `candidates.push(ghost_master_dir.join("shiori.so"));`
