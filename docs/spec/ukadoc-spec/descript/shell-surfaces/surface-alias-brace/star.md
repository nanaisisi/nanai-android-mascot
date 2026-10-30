# *（任意のエイリアス名）

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/star.md)
- **検索語**: *
- **対応状況**: ✅ 対応済 (surface-load.js)

## 突合結果

`ui/js/surface/surface-load.js` において、`surfaces.txt` 内の任意のエイリアス定義キーと配列解決を行う実装が行われている。

## 実装箇所

- `src-tauri/capabilities/default.json:5` `"windows": ["*"],`
- `src-tauri/gen/schemas/acl-manifests.json:1` `{"core":{"default_permission":{"identifier":"default","description":"Default cor`
- `src-tauri/gen/schemas/android-schema.json:40` `"description": "A grouping and boundary mechanism developers can use to isolate `
- `src-tauri/gen/schemas/android-schema.json:57` `"description": "Configure remote URLs that can use the capability permissions.\n`
- `src-tauri/gen/schemas/android-schema.json:114` `"description": "Remote domains this capability refers to using the [URLPattern s`
