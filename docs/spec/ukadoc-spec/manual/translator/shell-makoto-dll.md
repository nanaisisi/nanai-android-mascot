# シェル側 makoto.dll (`shell/<name>/makoto.dll`)

- **規格**: [translator.md](../../../../ukadoc-spec/manual/translator.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/translator/))
- **検索語**: shell/master/makoto.dll
- **対応状況**: ❌ 未実装

## 突合結果

各シェルフォルダ直下（`shell/master/makoto.dll` や `shell/<additional_shell>/makoto.dll`）に配置するシェル側トランスレータの探索、DLL ロード、`request` 実行、およびシェル切替時のトランスレータ差し替えは未実装。`src-tauri/src/ghost/scan/shell/mod.rs` のシェルスキャン処理でも `makoto.dll` の検出・保持を行っていない。

## 実装箇所

実装コード内に「shell/master/makoto.dll」は検出されませんでした。
