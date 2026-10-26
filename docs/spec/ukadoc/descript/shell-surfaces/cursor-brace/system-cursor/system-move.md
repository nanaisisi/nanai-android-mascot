# system:move

- **規格**: [system-move.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-move/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/system-cursor/system-move.md)
- **検索語**: system
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「system」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/windows/desktop-features.js:5`  `systemTray: false,`
- `ui/windows/desktop-features.js:20`  `if (tray) tray.textContent = featureStates.systemTray ? "ON" : "OFF";`
- `ui/windows/desktop-features.js:85`  `featureStates.systemTray = !featureStates.systemTray;`
- `ui/windows/desktop-features.js:86`  `console.log(システムトレイ: ${featureStates.systemTray});`
- `ui/windows/desktop-features.js:91`  `featureStates.systemTray ? "表示" : "非表示"`
