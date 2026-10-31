# \v

- **規格**: [v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/v/) (ukadoc-spec/list/sakura-script/event/v.md)
- **検索語**: \v
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「\v」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `cpp/yaya-shiori/deelx.h:2214` `nex2 = CHART_INFO(RCHART('\v'), 0, m_nNextPos, delta);`
- `cpp/yaya-shiori/deelx.h:2342` `case RCHART('\v'):`
- `cpp/yaya-shiori/deelx.h:2548` `pRange->m_chars.Push(RCHART('\v'));`
- `cpp/yaya-shiori/deelx.h:2561` `pRange->m_chars.Push(RCHART('\v'));`
- `cpp/yaya-shiori/sysfunc.cpp:5089` `arg2.replace(it,it+2,L"\v");`
