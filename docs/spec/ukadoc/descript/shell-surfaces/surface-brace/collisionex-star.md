# collisionex\*,ID,タイプ,座標1,座標2...

- **規格**: [collisionex-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collisionex-star.md)
- **検索語**: collisionex
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「collisionex」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-parser.js:84` (コメント) `// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]`
- `ui/js/surface/surface-parser.js:85`  `if (trimmed.startsWith("collisionex")) {`
