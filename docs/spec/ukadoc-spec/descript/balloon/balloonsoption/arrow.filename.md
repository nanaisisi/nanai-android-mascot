# arrow.filename,ファイル名

- **規格**: [arrow.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/arrow.filename.md)
- **検索語**: arrow.filename
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` 内 `setBalloonImage("arrow.filename", "--balloon-arrow-image")` にて動的解決・バインド対応済。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:92` `/// 吹き出しの矢印（しっぽ）画像ファイル名 (`arrow.filename`)`
- `crates/nanai-core/src/balloon_descript.rs:94` `self.get("arrow.filename")`
- `crates/nanai-core/src/balloon_descript.rs:161` `let content = "arrow.filename,arrow.png\nmarker.filename=marker.png\nclickwaitma`
- `ui/css/balloon-window.css:216` `/* バルーンオプション画像 (arrow.filename, clickwaitmarker.filename 等) */`
- `ui/css/balloon-window.css:221` `/* スクロール矢印 (arrow.filename: arrow0=上, arrow1=下) */`
