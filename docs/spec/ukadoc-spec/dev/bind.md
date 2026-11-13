# dev/bind.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/bind.md](../../../../ukadoc-spec/dev/bind.md) (着せ替え定義)
- **対応状況**: ✅ 実装済

## 突合結果

- `surfaces.txt` パーサおよび `surface-dressup.js` による着せ替えレイヤー合成・パーツ切り替え (`bindgroup`, `bindoption`) の実装完了。

## 実装箇所

- `crates/nanai-core/src/seriko_animation.rs:19` `pub interval: String, // sometimes, rarely, always, runagain, bind, never`
- `src-tauri/src/shiori/property/tests.rs:50` `assert_eq!(evaluate_property_query("sakura.bind.menu"), "");`
- `ui/assets/LICENSE-3RD-PARTY.html:171` `separable from, or merely link (or bind by name) to the interfaces of,`
- `ui/ts/ui/app-menu.ts:3` `import { dressupMenuPayload } from "../surface/bind-menu.js";`
- `tests/app-actions.test.ts:42` `const handle = actionMethods.handleMenuAction.bind(mockApp);`
- `crates/nanai-surface/src/types/draw/interval.rs:79` `"bind" => return Self::Bind,`
