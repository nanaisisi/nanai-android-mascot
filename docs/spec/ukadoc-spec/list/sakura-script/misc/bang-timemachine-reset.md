# \![timemachine,reset]

- **規格**: [bang-timemachine-reset.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-timemachine-reset/) (ukadoc-spec/list/sakura-script/misc/bang-timemachine-reset.md)
- **検索語**: timemachine
- **対応状況**: ✅ 実装済
- **保証レベル**: L3

## 突合結果

`ui/ts/ghost/command-handler/system/timemachine.ts` にて `handleTimemachineCommand` を実装し、`tests/timemachine-command.test.ts` で動作検証済み。

## 実装箇所

- `ui/ts/ghost/command-handler/system/timemachine.ts` `handleTimemachineCommand`
- `ui/ts/ghost/command-handler/defaults/system-handlers.ts` `registerCommandHandler("timemachine", ...)`
- `tests/timemachine-command.test.ts` `timemachine` コマンドテスト
