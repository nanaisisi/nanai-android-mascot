# install.txt

- **規格**: [introduction_install.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/introduction_install.txt/) (ukadoc-spec/descript/install/install-txt/introduction_install.txt.md)
- **検索語**: install.txt
- **対応状況**: ⚠️ 一部対応 (name/type 読み取り、Ghost 種別アーカイブ取り込み)

## 突合結果

`src-tauri/src/commands/install.rs` の NAR/zip 展開処理にて対応済み。
`install.txt` を Shift_JIS/UTF-8 自動判別で読み取り、`name`（オブジェクト名）と `type`
（取り込み種別）を解析する。`type=Ghost` のアーカイブのみ展開し、Shell/Balloon 等の
他種別は明示エラーで拒否する（誤取り込み防止）。

## 実装箇所

- `src-tauri/src/commands/install.rs:14` (コメント) `// アーカイブ内のinstall.txtまたはdescript.txtを検索してゴースト名を特定`
- `src-tauri/src/commands/install.rs:29` `if lower.ends_with("install.txt") || lower.ends_with("descript.txt") {`
- `src-tauri/src/commands/install.rs:62以降` `install.txt` の `name` / `type` 解析
- `src-tauri/src/commands/install.rs:109以降` `type` 種別検証 (Ghost のみ展開)
