# `sstp_new.png / sstp_newk.png / sstp_newp*def.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: sstp_new.png, sstp_newk.png, sstp_newp
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される SSTP 受信時の送信者情報表示専用画像 `sstp_new.png`（本体）・`sstp_newk.png`（相方、SSP 2.5.51〜）・`sstp_newp*def.png`（`\p[2]` 以降、SSP 2.5.51〜）について、ファイル解決と CSS 変数設定まで実装済みだが DOM 描画は未連携。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:294-331`) が `scopeId` に応じて `sstp_new.png`・`sstp_newk.png`・`sstp_newp${scopeId}def.png` を探索し、未検出時は `sstp.png` へフォールバックして `--balloon-sstpmarker-image` を設定する（`theme.ts:273-278` でも `sstp_new.png` / `sstp_newk.png` をプリロード）。しかし `ui/css/balloon-window.css:366-375` の `.sstp-marker` を SSTP 受信時に生成・表示する DOM 処理は未実装である。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:297` `? "sstp_newk.png"`
- `ui/ts/core/actions/balloon-descript/assets.ts:299` `` ? `sstp_newp${scopeId}def.png` ``
- `ui/ts/core/actions/balloon-descript/assets.ts:300` `: "sstp_new.png";`
- `ui/ts/core/actions/balloon-descript/assets.ts:327` `resolveAndSetSstpMarker(`
- `ui/ts/ghost/balloon-window/theme.ts:273` `invoke("load_balloon_image", { name: theme, file: "sstp_new.png" }).catch(`
- `ui/ts/ghost/balloon-window/theme.ts:276` `invoke("load_balloon_image", { name: theme, file: "sstp_newk.png" }).catch(`
- `ui/css/balloon-window.css:366` `.sstp-marker {`
