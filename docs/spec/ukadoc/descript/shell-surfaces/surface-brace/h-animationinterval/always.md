# always

- **規格**: [always.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/always.md)
- **検索語**: always
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「always」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/windows/desktop-features.js:4`  `alwaysOnTop: false,`
- `ui/windows/desktop-features.js:19`  `if (topmost) topmost.textContent = featureStates.alwaysOnTop ? "ON" : "OFF";`
- `ui/windows/desktop-features.js:53`  `featureStates.alwaysOnTop = !featureStates.alwaysOnTop;`
- `ui/windows/desktop-features.js:54`  `console.log(常に最前面: ${featureStates.alwaysOnTop});`
- `ui/windows/desktop-features.js:59`  `featureStates.alwaysOnTop ? "有効" : "無効"`
