# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ✅ 対応済

## 突合結果
- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決の実装完了。

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/linked_resources_binary_format/arm64Debug/processArm64DebugResources/output-metadata.json:16` `"outputFile": "linked-resources-binary-format-arm64Debug.ap_"`
- `src-tauri/shiori-host/target/.rustc_info.json:1` `{"rustc_fingerprint":5785422771802775894,"outputs":{"4670552594848531902":{"succ`
- `src-tauri/shiori-host/target/llvm-cov-target/.rustc_info.json:1` `{"rustc_fingerprint":5785422771802775894,"outputs":{"14116182289129251436":{"suc`
- `src-tauri/shiori-host/target/owl/.rustc_info.json:1` `{"rustc_fingerprint":5550528094855592342,"outputs":{"4313454036120855957":{"succ`
- `src-tauri/src/commands/web.rs:1` `//! Ukagaka Web Integration specification implementation (spec/web/x-ukagaka-lin`
