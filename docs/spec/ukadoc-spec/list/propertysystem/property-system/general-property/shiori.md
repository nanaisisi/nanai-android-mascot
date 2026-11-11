# shiori.変数名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/shiori/)
- **検索語**: shiori.
- **対応状況**: ⚠️ 一部対応

## 突合結果

ヒットしたのは一般的な語「shiori.」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/shiori/lifecycle/load.rs:60` `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle/load.rs:73` `candidates.push(ghost_master_dir.join("shiori.so"));`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:50` `candidates.push(ghost_master_dir.join("shiori.dll"));`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:63` `candidates.push(ghost_master_dir.join("shiori.so"));`
- `src-tauri/src/ghost/scan/directory/manifest.rs:145` `.and_then(|m| m.get("shiori.version").cloned());`
