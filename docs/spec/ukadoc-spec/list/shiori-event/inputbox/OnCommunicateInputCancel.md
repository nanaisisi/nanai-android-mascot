# OnCommunicateInputCancel

- **規格**: [OnCommunicateInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel.md)
- **検索語**: OnCommunicateInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「OnCommunicateInputCancel」が見つからない。


## 実装箇所

- `ui/js/ghost/command-handler/communicatebox.js:92` `"OnCommunicateInputCancel",`
- `ui/js/ghost/command-handler/communicatebox.js:130` `?.sendShioriEvent("OnCommunicateInputCancel", ["", "cancel"])`
- `ui/js/ui/renderers/modal-dialog-controller.js:373` `"OnCommunicateInputCancel",`
- `ui/js/ui/renderers/modal-dialog-controller.js:413` `* ※スクリプトからの close では OnCommunicateInputCancel は発生しない (UKADOC準拠)`
- `ui/js/ui/renderers/modal-dialog-controller.js:421` `this.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel", [`
