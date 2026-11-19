# `(element).pna`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: pnaFileName
- **対応状況**: ⚠️ 一部対応

## 突合結果

`applySurfaceImageToDom` 内の `resolveLayerImage` がパーツファイル名の拡張子を `.pna` へ置換して `pnaFileName` を生成し、`processChromaKey(layerSrc, layerPnaSrc)` へ渡してアルファ合成を行う。非 Tauri 経路では `${ghostPath}/shell/${shell}/${pnaFileName}` を参照できる一方、Tauri 経路では `load_surface_pna` が `surface{id}.pna` のみ探索するため任意ファイル名 `(element).pna` は解決できない。

## 実装箇所

- `ui/ts/surface/ghost-surface-dom.ts:90` `const pnaFileName = fileName.replace(/\.[^/.]+$/, ".pna");`
- `ui/ts/surface/ghost-surface-dom.ts:99` `layerPnaSrc = await controller`
- `ui/ts/surface/ghost-surface-dom.ts:104` `layerPnaSrc = convertFileSrc(`
- `ui/ts/surface/ghost-surface-dom.ts:114` `await controller.app.surfaceManager.processChromaKey(`
- `src-tauri/src/commands/file/surface_image.rs:170` `let candidates = vec![`
