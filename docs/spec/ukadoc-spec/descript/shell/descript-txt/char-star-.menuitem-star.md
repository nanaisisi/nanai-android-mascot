# char\*.menuitem\*,ID

- **規格**: [char-star-.menuitem-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star/) (ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star.md)
- **検索語**: char
- **対応状況**: ✅ 実装済

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:223` `fn parse_bracket_arg<I: Iterator<Item = char>>(`
- `src-tauri/src/commands/shiori/lifecycle/spawn.rs:91` `(b as char).to_string()`
- `ui/assets/LICENSE-3RD-PARTY.html:2198` `fn is_meta_character(c: char) -&gt; bool {`
- `ui/ts/ui/spec-compliance-runner.ts:525` `"surface.alias / kero.surface.alias / char*.surface.alias スコープ分離";`
- `tests/balloon-cycle9-robustness.test.ts:119` `it("resolves char<ID>.balloon.* alignment and offset when scopeId matches", () =`
- `crates/nanai-core/src/surfaces_parser.rs:101` `&& let Ok(id) = parts[0].trim_start_matches(|c: char| !c.is_ascii_digit()).parse`
