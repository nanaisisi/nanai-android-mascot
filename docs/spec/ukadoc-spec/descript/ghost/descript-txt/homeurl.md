# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `homeurl` キーをパース（`craftmanurl` のフォールバックおよびネットワーク更新参照用）し、`GhostInfo.craftman_url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [shiori,ファイル名], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL], [id,ID名]:`
