# \a

- **規格**: [a.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/a/) (ukadoc-spec/list/sakura-script/event/a.md)
- **検索語**: \a
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\a」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `cpp/yaya-shiori/deelx.h:2199` `nex2 = CHART_INFO(RCHART('\a'), 0, m_nNextPos, delta);`
- `cpp/yaya-shiori/sysfunc.cpp:5071` `arg2.replace(it,it+2,L"\a");`
- `cpp/yaya-shiori/sysfunc.cpp:7386` `array.emplace_back(L'\a');`
