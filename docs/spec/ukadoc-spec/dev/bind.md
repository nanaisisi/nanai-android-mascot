# dev/bind.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/bind.md](../../../../ukadoc-spec/dev/bind.md) (着せ替え定義)
- **対応状況**: ⚠️ 一部対応

## 突合結果

- `surfaces.txt` パーサおよび `surface-dressup.js` による着せ替えレイヤー合成・パーツ切り替え (`bindgroup`, `bindoption`) の実装完了。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:50` `assert_eq!(evaluate_property_query("sakura.bind.menu"), "");`
- `src-tauri/src/shiori/property/tests.rs:51` `assert_eq!(evaluate_property_query("kero.bind.menu"), "");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:72` `"sakura.bind.menu" => "",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:73` `"kero.bind.menu" => "",`
- `crates/ui/src/manifest.rs:118` `"charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,he`
