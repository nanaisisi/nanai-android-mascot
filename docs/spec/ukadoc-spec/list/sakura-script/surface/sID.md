# \sID番号

- **規格**: [sID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/sID/) (ukadoc-spec/list/sakura-script/surface/sID.md)
- **検索語**: Surface
- **対応状況**: ✅ 実装済

## 突合結果

\\s[ID] / \\sN サーフェス（表情・ポーズ）切替タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Surface)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:106` `SakuraToken::Surface(s_id) => {`
- `src-tauri/src/commands/file.rs:66` `shell_dir.join(format!("Surface{surface_id}.png")),`
- `ui/ts/core/actions/sstp-fmo-actions.ts:253` `lines.push(`Surface: ${payload.surface}`);`
- `ui/ts/ui/spec-compliance-runner.ts:527` `"surfaces.txt ➔ surfaceCollisionMethods.resolveSurfaceNumber ➔ Scope-Isolated Su`
- `tests/sakura-rust-bridge.test.ts:11` `{ type: "Surface", payload: 10 },`
- `crates/nanai-core/src/sakura_script.rs:16` `Surface(i32),`
