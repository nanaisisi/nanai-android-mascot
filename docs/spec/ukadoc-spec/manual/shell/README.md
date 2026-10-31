# シェル仕様の項目別突合

- **規格**: [ukadoc-spec/manual/shell.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/shell.md)
- **判定基準**: このリポジトリで確認できるサーフェス画像、PNA マスク、surfaces.txt 解析、シェル descript 設定

| 項目                                           | 対応状況 |
| ---------------------------------------------- | -------- |
| [サーフェス画像 (`surface*.png`)](surface-png.md) | ✅ 実装済  |
| [PNA アルファマスク (`surface*.pna`)](surface-pna.md) | ✅ 実装済  |
| [サーフェス定義 (`surfaces.txt`)](surfaces-txt.md) | ✅ 実装済  |
| [シェル設定 (`descript.txt`)](shell-descript.md) | ✅ 実装済  |

## 対応範囲の共通事項

- シェルは `assets/shell/<name>/` またはゴースト内の `shell/<name>/` から解決する。
- サーフェス画像と PNA マスクの合成処理、`surfaces.txt` の当たり判定・合成要素のパースに対応。
