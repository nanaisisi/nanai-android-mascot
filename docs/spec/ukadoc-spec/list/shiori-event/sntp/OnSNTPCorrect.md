# OnSNTPCorrect

- **規格**: [OnSNTPCorrect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/sntp/OnSNTPCorrect/) (ukadoc-spec/list/shiori-event/sntp/OnSNTPCorrect.md)
- **検索語**: OnSNTPCorrect
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnSNTPCorrect」が見つからない。


## 実装箇所

- `ui/js/ghost/command-handler/system/target.js:20` `* [bang-executesntp.md], [OnSNTPBegin.md], [OnSNTPCompare.md], [OnSNTPCompareEx.`
- `ui/js/ghost/command-handler/system/target.js:35` `await gc?.sendShioriEvent?.("OnSNTPCorrect", [nowIso]);`
- `ui/js/ghost/command-handler/system/target.js:36` `await gc?.sendShioriEvent?.("OnSNTPCorrectEx", [nowIso, "0"]);`
