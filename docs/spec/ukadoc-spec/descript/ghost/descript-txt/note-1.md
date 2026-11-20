# 補足

- **規格**: [note-1.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/note-1.md)
- **検索語**: 補足
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` および `ui/ts/core/actions/balloon-descript/layout/alignment.ts` において、`seriko.alignmenttodesktop`（`top`, `bottom`, `free`, `osuwari` 等のサーフェス画面吸着・追尾アライメント）のパースおよび画面位置制御を完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`alignment_to_desktop`)
- `ui/ts/core/actions/balloon-descript/layout/alignment.ts` (`alignmenttodesktop`)
