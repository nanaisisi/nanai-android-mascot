# %screenwidth

- **規格**: [pct-screenwidth.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-screenwidth/) (ukadoc-spec/list/sakura-script/environment-variable/pct-screenwidth.md)
- **検索語**: screenwidth
- **対応状況**: ⚠️ 一部対応

## 突合結果

さくらスクリプト環境変数展開処理 (crates/ui/src/script/env.rs) にて対応する変数の置換処理を実装。


## 実装箇所

- `crates/nanai-core/src/sakura_script/env.rs:229` `result = result.replace("%screenwidth", &ctx.screen_width().to_string());`
- `ui/ts/ghost/command-handler/env.ts:276` `"%screenwidth": screenWidth,`
- `ui/ts/ghost/command-handler/env.ts:294` `/%(lastobjectname|lastghostname|screenheight|screenwidth|wronghour|selfname2|sel`
