# OnSNTPFailure

- **規格**: [OnSNTPFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/sntp/OnSNTPFailure/) (ukadoc-spec/list/shiori-event/sntp/OnSNTPFailure.md)
- **検索語**: OnSNTPFailure
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「OnSNTPFailure」が見つからない。


## 実装箇所

- `ui/ts/ghost/command-handler/system/target.ts:25` `await gc?.sendShioriEvent?.("OnSNTPFailure", [String(err)]);`
