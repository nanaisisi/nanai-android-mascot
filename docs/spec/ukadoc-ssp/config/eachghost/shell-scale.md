# シェル倍率

- **規格**: [eachghost.md](../../../../ukadoc-ssp/config/eachghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/eachghost/))
- **検索語**: eachghost, scale
- **対応状況**: ✅ 実装済

## 突合結果

ゴーストごとのシェル倍率設定は未実装。


## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:62` `let scale = m.scale_factor();`
- `ui/ts/core/app-settings.ts:93` `balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100}`
- `ui/balloon.html:5` `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
- `tests/android-unified-layout.test.ts:13` `it("lays out side-by-side, bottom aligned, with scale and gap", () => {`
- `src-tauri/src/commands/window/menu_window.rs:63` `let w = size.width as f64 / scale;`
- `ui/ts/core/config.ts:9` `scale: Record<string, number>;`
