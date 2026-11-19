# `sstp.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: sstp.png
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` において `sstp.png` は「SSTP 受信時の送信者情報表示」と「`\![*]`（`%\*`）実行時のマーカー表示」の双方で用いられる共通画像として定義されている。コードでは `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:327-331`) が `sstp_new*` 未検出時のフォールバックとして `sstp.png` を読み込み `--balloon-sstpmarker-image` を設定し、`ui/css/balloon-window.css:366-375` に `.sstp-marker` スタイルも定義されているが、SSTP 受信時に `.sstp-marker` を DOM 生成する処理は未実装である。また `\![*]` マーカー解決 (`assets.ts:250-288`) は `marker.png` で終了し、`sstp.png` へフォールバックしない。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:270` `invoke("load_balloon_image", { name: theme, file: "sstp.png" }).catch(`
- `ui/ts/core/actions/balloon-descript/assets.ts:314` `resolveAndSetSstpMarker(fallbackFile, "sstp.png", cssVar);`
- `ui/ts/core/actions/balloon-descript/assets.ts:329` `"sstp.png",`
- `ui/css/balloon-window.css:366` `.sstp-marker {`
- `crates/nanai-core/src/balloon_descript.rs:131` `pub fn sstp_marker_filename(&self) -> Option<&str> {`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:125` `"sstpmarker.filename": "sstp.png",`
