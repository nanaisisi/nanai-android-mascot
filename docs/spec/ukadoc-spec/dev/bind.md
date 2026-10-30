# dev/bind.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/bind.md](../../../../ukadoc-spec/dev/bind.md) (着せ替え定義)
- **対応状況**: ✅ 対応済

## 突合結果
- `surfaces.txt` パーサおよび `surface-dressup.js` による着せ替えレイヤー合成・パーツ切り替え (`bindgroup`, `bindoption`) の実装完了。

## 実装箇所

- `src-tauri/src/lib.rs:50` `"../ui/bindings.ts",`
- `src-tauri/src/lib.rs:52` `.expect("Failed to export TypeScript bindings");`
- `src-tauri/src/lib.rs:53` `if let Ok(content) = std::fs::read_to_string("../ui/bindings.ts") {`
- `src-tauri/src/lib.rs:57` `let _ = std::fs::write("../ui/bindings.ts", patched);`
- `src-tauri/src/commands/shell/manifest.rs:131` `binds: Option<Vec<u32>>,`
