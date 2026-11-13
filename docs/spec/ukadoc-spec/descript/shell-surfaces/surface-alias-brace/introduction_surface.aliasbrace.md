# surface.aliasブレス記述例

- **規格**: [introduction_surface.aliasbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace/) (ukadoc-spec/descript/shell-surfaces/surface-alias-brace/introduction_surface.aliasbrace.md)
- **検索語**: surface.alias
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/surface/surface-load.js` において、`surfaces.txt` 内の `surface.alias` ブレース定義をパースし適用する実装が行われている。

## 実装箇所

- `crates/nanai-surface/src/parser/tests.rs:10` `surface.alias {\r\nmain,0,1\r\n,empty_alias\r\nno_comma_alias\r\n}\r\n\`
- `ui/ts/surface/surface-collision.ts:48` `// 2. Alias lookup (`surface.alias`/`kero.surface.alias`/`char<N>.surface.al`
- `ui/ts/ui/spec-compliance-runner.ts:525` `"surface.alias / kero.surface.alias / char*.surface.alias スコープ分離";`
- `tests/parser-fuzzing/surfaces-txt-fuzzing.test.ts:160` `// Cycle 10 multi-character alias blocks parsing: surface.alias, kero.surface.al`
- `crates/nanai-surface/src/parser/tests.rs:11` `kero.surface.alias {\r\nkmain,10\r\n}\r\n\`
- `ui/ts/surface/parser/index.ts:74` `// *.surface.alias ブロック開始判定`
