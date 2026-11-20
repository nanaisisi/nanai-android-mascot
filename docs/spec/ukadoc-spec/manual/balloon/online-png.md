# `online*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: online0.png, onlinemarker
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるネットワーク情報受信中の連番アニメーション画像 `online*.png` に対し、設定パース・単一ファイルプリロード（`online0.png` / `online00.png` / `online.png` フォールバック）・CSS ルール（`ui/css/balloon-window.css` の `.online-marker`）が実装されている。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:357-365,512-521`) で `onlinemarker.filename`（`--balloon-online-image`）、`onlinemarker.interval`、`onlinemarker.x` / `y`（`--balloon-online-x` / `y`）を設定し、`BalloonOptionsManifest::online_marker_filename` (`crates/nanai-core/src/balloon_descript.rs:126`) も定義済み。DOM 要素の動的生成と番号順アニメーションループは未実装。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:279` `invoke("load_balloon_image", {`
- `ui/ts/ghost/balloon-window/theme.ts:281` `file: "online0.png",`
- `ui/ts/core/actions/balloon-descript/assets.ts:291` `setBalloonImage("onlinemarker.filename", "--balloon-online-image");`
- `ui/ts/core/actions/balloon-descript/assets.ts:439` `const onlineInterval = parseInt(props["onlinemarker.interval"], 10);`
- `crates/nanai-core/src/balloon_descript.rs:126` `pub fn online_marker_filename(&self) -> Option<&str> {`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:154` `assert.equal(instance.onlineMarkerInterval, 500);`
