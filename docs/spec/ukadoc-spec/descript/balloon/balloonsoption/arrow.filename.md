# arrow.filename,ファイル名

- **規格**: [arrow.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/arrow.filename.md)
- **検索語**: arrow.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` 内 `setBalloonImage("arrow.filename", "--balloon-arrow-image")` にて動的解決・バインド対応済。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:92` `/// 吹き出しの矢印（しっぽ）画像ファイル名 (`arrow.filename`)`
- `ui/ts/core/actions/balloon-descript/assets.ts:141` `// [arrow.filename,ファイル名]: UKADOC 準拠ベース名展開 (拡張子なし -> arrow0=上 / arrow1=下)`
- `ui/css/balloon-window.css:216` `/* バルーンオプション画像 (arrow.filename, clickwaitmarker.filename 等) */`
- `tests/core-actions.test.ts:46` `"arrow.filename": "",`
- `crates/nanai-core/src/balloon_descript.rs:94` `self.get("arrow.filename")`
- `ui/ts/core/actions/balloon-descript/assets.ts:146` `const defaultArrowBase = p["arrow.filename"]`
