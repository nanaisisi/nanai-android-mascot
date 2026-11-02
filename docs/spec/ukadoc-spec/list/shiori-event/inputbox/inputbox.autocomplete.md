# inputbox.autocomplete

- **規格**: [inputbox.autocomplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/inputbox.autocomplete/) (ukadoc-spec/list/shiori-event/inputbox/inputbox.autocomplete.md)
- **検索語**: inputbox.autocomplete
- **対応状況**: ✅ 実装済

## 突合結果

ダイアログ展開時に `inputbox.autocomplete` SHIORIイベントを送信し、バイト値1区切りのテキスト候補リストから `<datalist>` を動的生成・入力要素へ紐付ける処理を実装 (`ui/js/ui/renderers/modal-dialog-controller.js` -> `attachAutocomplete`)。


## 実装箇所

- `ui/js/ui/renderers/modal-dialog-controller.js:22` `* inputbox.autocomplete イベントを問い合わせて datalist を設定`
- `ui/js/ui/renderers/modal-dialog-controller.js:36` `"inputbox.autocomplete",`
