# dev/bind.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/bind.md](../../../../ukadoc-spec/dev/bind.md) (着せ替え定義)
- **対応状況**: ✅ 対応済

## 実装方針・確認事項

- `surfaces.txt` パーサ (`crates/nanai-core/src/surfaces_parser.rs`) および `ui/ts/surface/surface-dressup.ts` による `bindgroup`・`bindoption` 定義の解析とレイヤー合成に対応。
