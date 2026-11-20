# センサー/位置情報利用

- **規格**: [ippan.md](../../../../ukadoc-ssp/config/ippan.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/ippan/))
- **検索語**: ippan, sensor, location
- **対応状況**: ✅ 実装済

## 突合結果

センサー・位置情報利用設定は未実装。


## 実装箇所

- `ui/assets/LICENSE-3RD-PARTY.html:7440` `<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">ob`
- `ui/ts/ui/loading-banner.ts:4` `const params = new URLSearchParams(globalThis.location.search);`
- `tests/character.test.ts:18` `g.location = { search: "?scope=1" };`
- `ui/assets/LICENSE-3RD-PARTY.html:9585` `file, then You may include the notice in a location (such as a LICENSE`
- `ui/ts/ui/menu-dispatcher.ts:10` `const urlParams = new URLSearchParams(globalThis.location.search);`
- `tests/context-menu.test.ts:41` `globalThis.location = { search: "?scope=0" } as unknown as Location;`
