# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「always」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/windows/desktop-features.js:4`  `alwaysOnTop: false,`
- `ui/windows/desktop-features.js:19`  `if (topmost) topmost.textContent = featureStates.alwaysOnTop ? "ON" : "OFF";`
- `ui/windows/desktop-features.js:53`  `featureStates.alwaysOnTop = !featureStates.alwaysOnTop;`
- `ui/windows/desktop-features.js:54`  `console.log(常に最前面: ${featureStates.alwaysOnTop});`
- `ui/windows/desktop-features.js:59`  `featureStates.alwaysOnTop ? "有効" : "無効"`
