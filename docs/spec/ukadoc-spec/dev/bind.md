# dev/bind.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/bind.md](../../../../ukadoc-spec/dev/bind.md) (着せ替え定義)
- **対応状況**: ✅ 対応済

## 突合結果
- `surfaces.txt` パーサおよび `surface-dressup.js` による着せ替えレイヤー合成・パーツ切り替え (`bindgroup`, `bindoption`) の実装完了。

## 実装箇所
- `crates/ui/src/surfaces/` surfaces.txt パーサ
- `ui/js/surface/surface-dressup.js` 着せ替え合成
