# Number

- **規格**: [internal_random.Number.md](https://ukatech.shillest.net/ukadoc-spec/spec/saori-ex/internal_random/internal_random.Number/) (ukadoc-spec/spec/saori-ex/internal_random/internal_random.Number.md)
- **検索語**: Number
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「Number」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/surface/surface-parser.js:48` `const [start, end] = part.split("-").map((v) => Number.parseInt(v, 10));`
- `ui/js/surface/surface-parser.js:90` `const x1 = Number.parseInt(parts[3], 10);`
- `ui/js/surface/surface-parser.js:91` `const y1 = Number.parseInt(parts[4], 10);`
- `ui/js/surface/surface-parser.js:92` `const x2 = Number.parseInt(parts[5], 10);`
- `ui/js/surface/surface-parser.js:93` `const y2 = Number.parseInt(parts[6], 10);`
