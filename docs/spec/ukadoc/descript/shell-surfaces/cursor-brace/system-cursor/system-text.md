# system:text

- **規格**: [system-text.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-text.md)
- **検索語**: system
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「system」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/windows/desktop-features.js:5`  `systemTray: false,`
- `ui/windows/desktop-features.js:20`  `if (tray) tray.textContent = featureStates.systemTray ? "ON" : "OFF";`
- `ui/windows/desktop-features.js:85`  `featureStates.systemTray = !featureStates.systemTray;`
- `ui/windows/desktop-features.js:86`  `console.log(システムトレイ: ${featureStates.systemTray});`
- `ui/windows/desktop-features.js:91`  `featureStates.systemTray ? "表示" : "非表示"`
