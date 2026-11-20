# onlinemarker.filename,ファイル名

- **規格**: [onlinemarker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/onlinemarker.filename.md)
- **検索語**: onlinemarker.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setBalloonImage("onlinemarker.filename", "--balloon-online-image")` にて動的解決・CSSバインドを完全実装済み。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:125` `/// オンライン通信中マーカー画像ファイル名 (`onlinemarker.filename`)`
- `ui/ts/core/actions/balloon-descript/assets.ts:356` `// [onlinemarker.filename,ファイル名] または UKADOC 標準オンラインマーカー (`online0.png`, `online0`
- `tests/balloon-assets.test.ts:48` `it("uses explicit onlinemarker.filename when provided", async () => {`
- `crates/nanai-core/src/balloon_descript.rs:127` `self.get("onlinemarker.filename")`
- `ui/ts/core/actions/balloon-descript/assets.ts:357` `if (p["onlinemarker.filename"]) {`
- `tests/balloon-assets.test.ts:53` `{ "onlinemarker.filename": "custom_online.png" },`
