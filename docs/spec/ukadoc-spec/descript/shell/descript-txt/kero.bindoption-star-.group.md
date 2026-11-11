# kero.bindoption\*.group,カテゴリ名,オプション

- **規格**: [kero.bindoption-star-.group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.bindoption-star-.group/) (ukadoc-spec/descript/shell/descript-txt/kero.bindoption-star-.group.md)
- **検索語**: kero.bindoption
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「kero.bindoption」が見つからない。

## 実装箇所

- `ui/ts/surface/bind-menu.ts:13` `return scopeId === 0 ? "sakura.bindoption.group" : "kero.bindoption.group";`
- `tests/bind-menu.test.ts:19` `assert.equal(bindOptionKey(1), "kero.bindoption.group");`
