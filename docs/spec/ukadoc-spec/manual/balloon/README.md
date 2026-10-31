# バルーン仕様の項目別突合

- **規格**: [ukadoc-spec/manual/balloon.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/balloon.md)
- **判定基準**: このリポジトリで確認できる読込・描画・導入処理

| 項目                                                                   | 対応状況                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| [descript.txt](descript-txt.md)                                        | ✅ 実装済                                           |
| [balloons*s.txt / balloonk*s.txt / balloonc*s.txt](surface-options.md) | ✅ 実装済                                           |
| [readme.txt](readme-txt.md)                                            | ✅ 実装済                                           |
| [balloons*.png](balloons-png.md)                                       | ✅ 実装済                                           |
| [balloons*.pna](balloons-pna.md)                                       | ✅ 実装済                                           |
| [balloonk*.png](balloonk-png.md)                                       | ✅ 実装済                                           |
| [balloonk*.pna](balloonk-pna.md)                                       | ✅ 実装済                                           |
| [balloonp*def*.png / .pna](balloonp.md)                                | ✅ 実装済                                           |
| [balloonc*.png / .pna](balloonc.md)                                    | ✅ 実装済                                           |
| [online*.png](online-png.md)                                           | ✅ 実装済                                           |
| [arrow*.png](arrow-png.md)                                             | ✅ 実装済                                           |
| [sstp.png](sstp-png.md)                                                | ✅ 実装済                                           |
| [thumbnail.png](thumbnail-png.md)                                      | ✅ 実装済                                           |
| [SSP 専用画像](ssp-assets.md)                                          | ✅ 実装済                                           |
| [バルーン FMO 連携](balloon-fmo.md)                                    | ✅ 実装済                                           |
| [バルーン 9-slice 描画](balloon-9slice.md)                             | ✅ 実装済                                           |

## 対応範囲の共通事項

- バルーンは `assets/balloon/<name>/` から解決する。
- `descript.txt` のフォント、色、`validrect`、`wordwrappoint.x` を読み込み、独立バルーンウィンドウへ反映する。
- バルーン画像は Tauri コマンド `load_balloon_image` で読み込み、CSS の 9-slice 表示に利用する。
- `\0` と `\1` はスコープ別の独立ウィンドウで表示する。
