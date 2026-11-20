# ghost/master/descript.txt

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: parse_ghost_manifest, read_descript_file
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `descript.txt`（ゴーストを識別するための必須設定ファイル）に対応し、`read_descript_file` が UTF-8 / `charset,Shift_JIS` 判定付きで `,` / `:` 区切りのキー値を読み込み、`parse_ghost_manifest` が `ghost/master/descript.txt` を最優先参照して `name`・`title`・`version`・`sakura.name`・`kero.name`・`char*.name`・`shiori`・`makoto`・`craftman`・`recommended.balloon`・`shiori.*`・`sstp.*`・`install.accept` を抽出する。`crates/nanai-core` にも共通 `DescriptManifest` パーサーを備える。

## 実装箇所

- `src-tauri/src/ghost/scan/descript.rs:7` `pub fn read_descript_file(file_path: &Path) -> Option<HashMap<String, String>> {`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:8` `pub fn parse_ghost_manifest(path: &Path, dir_name: &str) -> GhostManifest {`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:10` `path.join("ghost").join("master").join("descript.txt"),`
- `crates/nanai-core/src/descript_parser/types.rs:8` `pub struct DescriptManifest {`
- `src-tauri/src/ghost/scan/directory/manifest/tests.rs:5` `fn test_parse_ghost_manifest_with_makoto() {`
