# SHIORI/3.0 capability: 実装対応状況の検知

- **規格**: [capability.md](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/capability/) (ukadoc-spec/spec/shiori3/capability.md)
- **対応状況**: ❌ 未実装

## 突合結果

Capability 系ヘッダ・イベント処理は未実装 (検出されず)。

## 備考

- 突合は実装コード (src-tauri/src、ui/js) の文字列検索に基づく一次調査です。
- 規格の詳細は参照元ドキュメントを参照してください。


## 実装箇所

- `src-tauri/gen/schemas/android-schema.json:4` `"description": "Capability formats accepted in a capability file.",`
- `src-tauri/gen/schemas/android-schema.json:7` `"description": "A single capability.",`
- `src-tauri/gen/schemas/android-schema.json:40` `"description": "A grouping and boundary mechanism developers can use to isolate `
- `src-tauri/gen/schemas/android-schema.json:48` `"description": "Identifier of the capability.\n\n## Example\n\n`main-user-files-`
- `src-tauri/gen/schemas/android-schema.json:52` `"description": "Description of what the capability is intended to allow on assoc`
