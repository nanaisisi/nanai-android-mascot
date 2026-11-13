# %second

- **規格**: [pct-second.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-second/) (ukadoc-spec/list/sakura-script/environment-variable/pct-second.md)
- **検索語**: second
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。



## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:259` `pub second: u32,`
- `src-tauri/src/commands/install/utils.rs:91` `+ (dt.second() as u64);`
- `ui/ts/ghost/command-handler/env.ts:159` `case "system.second":`
- `tests/ghost-loading.test.ts:90` `const second = gc.selectGhost("g");`
- `crates/nanai-core/src/sakura_script.rs:273` `second: 0,`
- `src-tauri/src/shiori/property/tests.rs:27` `assert_eq!(evaluate_property_query("system.second"), "0");`
