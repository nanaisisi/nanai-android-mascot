# シェル倍率 [シェル個別]

- **規格**: [ghost2.md](../../../../ukadoc-ssp/config/ghost2.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/ghost2/))
- **検索語**: ghost2, scale
- **対応状況**: ✅ 実装済

## 突合結果

シェル倍率設定の一部を実装。


## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:62` `let scale = m.scale_factor();`
- `ui/ts/core/app-settings.ts:93` `balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100}`
- `ui/ts/ui/templates/settings-templates.ts:15` `<button type="button" class="ssp-tab-btn" data-tab="ghost2" style="padding: 3px `
- `tests/shiori-notify/helpers.ts:109` `path: "/assets/ghost/ghost2",`
- `src-tauri/src/commands/window/menu_window.rs:63` `let w = size.width as f64 / scale;`
- `ui/ts/core/config.ts:9` `scale: Record<string, number>;`
