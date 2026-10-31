# update-file : 生成処理

- **規格**: [generation.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/generation/) (ukadoc-spec/spec/update-file/generation.md)
- **対応状況**: ❌ 未実装

## 突合結果

クライアント実行環境のため、更新定義ファイルの生成機能は未実装。

## 実装箇所

- `ui/js/ghost/ghost.js:164` `const generation = this._ghostLoadGeneration;`
- `ui/js/ghost/ghost.js:231` `() => this._ghostLoadGeneration === generation,`
