# \f[outline,パラメータ]

- **規格**: [f-outline.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-outline/) (ukadoc-spec/list/sakura-script/font/f-outline.md)
- **検索語**: \f
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「\f」を確認。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:31` `/// フォント設定 (\f[bold,true], \f[color,r,g,b], \f[height,12] 等 - UKADOC仕様準拠)`
- `src-tauri/src/common/paths.rs:180` `clean_verbatim_path(r"\\?\C:\path\to\file"),`
- `ui/ts/ghost/parser/tag/text-format.ts:3` `* @brief 改行・クリア・ポーズ・描画速度・フォントタグのトークナイズ処理 (\n, \c, \x, \_q, \f)`
- `tests/tag-tokenizer.test.ts:155` `// \f[bold,1], \f[default]`
- `crates/nanai-core/src/sakura_script.rs:356` `let script = "\\f[color,255,128,0]赤文字\\f[default]";`
- `src-tauri/src/common/paths.rs:181` `r"C:\path\to\file"`
