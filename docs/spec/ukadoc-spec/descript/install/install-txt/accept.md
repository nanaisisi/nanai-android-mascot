# accept,本体側名

- **規格**: [accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/accept.md)
- **検索語**: accept
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `accept` キーをパースし、受け入れベースウェア判定を行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:53` `// [install.txt（概要）], [同時インストール], [name,オブジェクト名], [type,種別], [directory,ディレクトリ名]`
- `src-tauri/src/commands/install/archive.rs:56` `let accept = map.get("accept");`
- `src-tauri/src/commands/install/archive.rs:57` `// [@manual: manual/install.md] accept target compatibility validation`
- `src-tauri/src/commands/install/archive.rs:58` `if let Some(acc) = accept {`
- `src-tauri/src/commands/install/archive.rs:60` `"📦 [Install] Accept target compatibility check: package requires accept={}",`
