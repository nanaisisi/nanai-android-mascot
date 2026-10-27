# バルーン仕様の項目別突合

- **規格**: [ukadoc-spec/manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **判定基準**: このリポジトリで確認できる読込・描画・導入処理

| 項目 | 対応状況 |
| --- | --- |
| [descript.txt](descript-txt.md) | ⚠️ 部分対応 |
| [balloons*s.txt / balloonk*s.txt / balloonc*s.txt](surface-options.md) | ❌ 未対応 |
| [readme.txt](readme-txt.md) | ⚠️ 配布物として保持 |
| [balloons*.png](balloons-png.md) | ⚠️ `0` のみ通常表示に使用 |
| [balloons*.pna](balloons-pna.md) | ⚠️ ファイル読込経路はあるが専用アルファ適用は未確認 |
| [balloonk*.png](balloonk-png.md) | ⚠️ `balloonk0.png` を相方用に使用 |
| [balloonk*.pna](balloonk-pna.md) | ⚠️ 専用アルファ適用は未確認 |
| [balloonp*def*.png / .pna](balloonp.md) | ❌ 未対応 |
| [balloonc*.png / .pna](balloonc.md) | ❌ 未対応 |
| [online*.png](online-png.md) | ❌ 未対応 |
| [arrow*.png](arrow-png.md) | ❌ 未対応 |
| [sstp.png](sstp-png.md) | ❌ 未対応 |
| [thumbnail.png](thumbnail-png.md) | ⚠️ 導入物には存在するが選択画面での表示は未確認 |
| [SSP 専用画像](ssp-assets.md) | ❌ 未対応 |

## 対応範囲の共通事項

- バルーンは `assets/balloon/<name>/` から解決する。
- `descript.txt` のフォント、色、`validrect`、`wordwrappoint.x` を読み込み、独立バルーンウィンドウへ反映する。
- バルーン画像は Tauri コマンド `load_balloon_image` で読み込み、CSS の 9-slice 表示に利用する。
- `\0` と `\1` はスコープ別の独立ウィンドウで表示する。
