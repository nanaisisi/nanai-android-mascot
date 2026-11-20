# char*.balloon.defaultsurface,数値

- **規格**: [char-star-.balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.balloon.defaultsurface.md)
- **検索語**: char*.balloon.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `GhostInfo` モデルにおいて `char*.balloon.defaultsurface` キー群（`char0.balloon.defaultsurface` 等）を動的パース・マップ保持する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
