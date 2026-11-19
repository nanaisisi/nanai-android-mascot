# `arrows*.png / arrowk*.png / arrowp*def*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: arrowk, arrows, arrowp
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるスコープ別スクロール矢印画像 `arrows0.png` / `arrows1.png`（本体）・`arrowk0.png` / `arrowk1.png`（相方）・`arrowp*def0.png` / `arrowp*def1.png`（`\p[2]` 以降、SSP 2.4.78 / 2.5.51〜専用）のうち、本体・相方用ファイル名は解決されるが `\p[2]` 以降の命名規約が仕様と不一致である。`applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:208-244`) は `arrow.filename` 未指定時に `scopeId === 0` で `arrows`、`scopeId === 1` で `arrowk`、`scopeId >= 2` で `arrowp${scopeId}` をベース名として `{base}0.png` / `{base}1.png` を探索するため、仕様の `arrowp*def0.png` / `arrowp*def1.png` を検出できない。また `.pna` 合成や自然幅・高さの取得は `theme.ts:522-555` の `arrow0.png` / `arrow1.png` フォールバック経路にのみ実装されている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:208` `const defaultArrowBase = p["arrow.filename"]`
- `ui/ts/core/actions/balloon-descript/assets.ts:211` `? "arrowk"`
- `ui/ts/core/actions/balloon-descript/assets.ts:213` `` ? `arrowp${scopeId}` ``
- `ui/ts/core/actions/balloon-descript/assets.ts:214` `: "arrows";`
- `ui/ts/core/actions/balloon-descript/assets.ts:239` `` resolveAndSetArrow(`${arrowBaseName}0.png`, "--balloon-arrow0-image"); ``
- `ui/ts/core/actions/balloon-descript/assets.ts:240` `` resolveAndSetArrow(`${arrowBaseName}1.png`, "--balloon-arrow1-image"); ``
