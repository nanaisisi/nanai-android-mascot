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

- `src-tauri/src/commands/install/archive.rs:19` `if lower == "install.txt" || lower.ends_with("/install.txt") {`
- `src-tauri/src/commands/install/archive.rs:101` `"install.txt type={label} ({kind}): サポートされていないアーカイブ種別です"`
- `src-tauri/src/commands/install/archive.rs:219` `target_dir.join("install.txt"),`
- `src-tauri/src/ghost/scan/directory.rs:58` `path.join("install.txt"),`
- `src-tauri/src/ghost/scan/date.rs:62` `consider(&path.join("install.txt"));`
