# runonce

- **規格**: [runonce.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce.md)
- **検索語**: runonce
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:51` (コメント) `// runonce: サーフィス切り替え直後に1回のみ実行`
- `ui/js/surface/surface-animation-manager.js:52`  `if (intervalStr === "runonce") {`
