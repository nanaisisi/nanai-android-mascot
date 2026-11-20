# `descript.txt` (バルーン)

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloon_descript_map
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるバルーン識別・表示設定ファイル `descript.txt` の読み込みと適用を実装済み。バックエンドの `balloon_descript_map` (`src-tauri/src/commands/shell/balloon.rs:565`) が `Descript::parse` (`crates/ui/src/descript/parser/mod.rs:25`) で `descript.txt` をパースし、`balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs:181`) が個別オプションファイルとマージして返す。フロントエンドでは `applyBalloonDescript` (`ui/ts/ghost/balloon-window/theme.ts:308`) および `balloonDescriptActions.applyBalloonDescript` (`ui/ts/core/actions/balloon-descript.ts:17`) が `validrect`・`wordwrappoint`・フォント・色・アセット・カーソル等を適用し、`validate_balloon_descript` (`crates/nanai-core/src/balloon_descript.rs:25`) / `verifyRecommendedGhost` (`ui/ts/core/actions/balloon-descript/assets.ts:34`) で推奨ゴースト判定にも対応している。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:565` `pub fn balloon_descript_map(dir: &std::path::Path) -> std::collections::BTreeMap<String, String> {`
- `src-tauri/src/commands/shell/balloon.rs:181` `pub fn balloon_manifest(`
- `crates/ui/src/descript/parser/mod.rs:25` `pub fn parse(content: &str) -> Self {`
- `crates/nanai-core/src/balloon_descript.rs:25` `pub fn validate_balloon_descript(`
- `ui/ts/ghost/balloon-window/theme.ts:308` `export async function applyBalloonDescript({`
- `ui/ts/core/actions/balloon-descript.ts:17` `applyBalloonDescript(props: Record<string, string> = {}) {`
- `ui/ts/core/actions/balloon-descript/assets.ts:102` `export function applyAssetProperties(`
- `tests/balloon-descript/all-properties.test.ts:15` `test("balloonDescriptActions covers rgbFromComponents and applyBalloonDescript for all UKADOC properties", () => {`
- `tests/balloon-window/theme.test.ts:10` `test("loadBalloonSkinImages and applyBalloonDescript load and apply theme descript manifest", async () => {`
