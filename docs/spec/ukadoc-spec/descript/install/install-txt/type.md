# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/type.md)
- **検索語**: type
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `type` キー（`ghost`, `balloon`, `shell`, `plugin`, `headline`, `supplement`, `package`）をパースし、インストールターゲット種別を判定・振り分ける実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別]...`
