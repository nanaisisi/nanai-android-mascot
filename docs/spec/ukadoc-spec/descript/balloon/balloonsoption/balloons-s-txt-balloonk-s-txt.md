# balloons\*s.txt/balloonk\*s.txt

- **規格**: [balloons-s-txt-balloonk-s-txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/balloons-s-txt-balloonk-s-txt.md)
- **検索語**: balloons
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` において `scopeId === 0` (さくら / `balloons0.png`) と `scopeId === 1` (kero / `balloonk0.png`) の複数スコープ独立バルーン画像を動的切り替えする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:51` `balloons: std::collections::BTreeMap<u32, i32>,`
- `src-tauri/src/commands/shell/balloon.rs:16` `let mut balloons = Vec::new();`
- `ui/ts/core/actions/balloon-theme.ts:177` `const balloons = await invoke("scan_balloons");`
- `ui/ts/ui/app-menu.ts:140` `"sync-balloons",`
- `tests/context-menu.test.ts:146` `await tauriListeners["sync-balloons"]?.({ payload: [{ name: "default" }] });`
- `crates/nanai-core/src/sakura_player.rs:66` `balloons: std::collections::BTreeMap::new(),`
