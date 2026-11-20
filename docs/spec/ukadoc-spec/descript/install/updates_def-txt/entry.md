# 相対パス,ignore

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/updates_def-txt/entry/) (ukadoc-spec/descript/install/updates_def-txt/entry.md)
- **検索語**: ignore
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/ui/src/update/parser/update_definition.rs` (`parse_update_definition`) および `crates/ui/src/update/types.rs` (`is_ignored`) において `updates_def.txt` 内の「相対パス,ignore」および各種オプションフラグ (`readonly`, `delete`, `size=`) のパース・判定が完全実装済み。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs:65` `} else if extra_trimmed.eq_ignore_ascii_case("ignore") {`
- `src-tauri/src/ghost/scan/directory/package_files.rs:72` `ignore: Option<PatternSet>,`
- `ui/assets/LICENSE-3RD-PARTY.html:8301` `<li><a href="https://github.com/BurntSushi/ripgrep/tree/master/crates/ignore" ta`
- `ui/ts/ui/context-menu.ts:274` `const { getCurrentWindow } = await import(/* @vite-ignore */ modName);`
- `crates/ui/src/update/parser/update_definition.rs:67` `option_flags.push("ignore".to_string());`
- `src-tauri/src/ghost/scan/directory/package_files.rs:79` `ignore: PatternSet::load(&root.join(".narignore")),`
