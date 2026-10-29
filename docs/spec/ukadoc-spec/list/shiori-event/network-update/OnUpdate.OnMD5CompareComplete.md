# OnUpdate.OnMD5CompareComplete

- **規格**: [OnUpdate.OnMD5CompareComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/)
- **検索語**: OnUpdate.OnMD5CompareComplete
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の MD5 照合成功通知 (`update-progress` / phase `md5-complete`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `ui/js/core/app-update.js:15` `*    - OnUpdate.OnMD5CompareComplete / OnUpdate.OnMD5CompareFailure`
- `ui/js/core/app-update.js:159` `gc.sendShioriEvent("OnUpdate.OnMD5CompareComplete", [`
