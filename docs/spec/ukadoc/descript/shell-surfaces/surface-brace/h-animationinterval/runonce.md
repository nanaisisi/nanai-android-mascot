# runonce

- **規格**: [runonce.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/runonce.md)
- **検索語**: runonce
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「runonce」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:51` (コメント) `// runonce: サーフィス切り替え直後に1回のみ実行`
- `ui/js/surface/surface-animation-manager.js:52`  `if (intervalStr === "runonce") {`
