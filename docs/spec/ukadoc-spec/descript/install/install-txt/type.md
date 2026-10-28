# type,種別

- **規格**: [type.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/type/) (ukadoc-spec/descript/install/install-txt/type.md)
- **検索語**: type
- **対応状況**: ⚠️ 一部対応 (Ghost 以外の種別は取り込み拒否)

## 突合結果

`src-tauri/src/commands/install.rs` の NAR 展開処理にて `install.txt` の `type` を
解析する。`type=Ghost`（大文字小文字区別なし、後続カンマ許容）のアーカイブのみ
取り込み、Shell / Balloon / Plugin / Supplement 等は明示エラーで拒否する。

## 実装箇所

- `src-tauri/src/commands/install.rs` `install.txt` `type` 解析と種別検証（`Ghost` のみ展開）
