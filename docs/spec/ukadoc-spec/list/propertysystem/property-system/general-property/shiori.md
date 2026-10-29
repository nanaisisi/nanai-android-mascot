# shiori.変数名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/shiori/)
- **検索語**: shiori.
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「shiori.」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/load.rs:55` `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:68` `candidates.push(ghost_master_dir.join("shiori.so"));`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:69` `candidates.push(ghost_master_dir.join("libshiori.so"));`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:48` `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:61` `candidates.push(ghost_master_dir.join("shiori.so"));`
