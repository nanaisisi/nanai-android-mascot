# 起動オプション一覧

- **規格**: [option.md](../../../../docs/ukadoc-ssp/functions/option.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/option/))
- **対応状況**: ✅ 実装済

倍率変更、クリックスルー透過、常時最前面

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [起動オプションとは？](option/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「起動オプションとは？」 |
| [利用方法](option/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「利用方法」 |
| [オプション一覧](option/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「オプション一覧」 |
| [--option オプション](option/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「--option オプション」 |
| [一般オプション](option/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「一般オプション」 |
| [オフラインサーフェスダンプ](option/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「オフラインサーフェスダンプ」 |
| [オフラインツール](option/section-07.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「オフラインツール」 |
| [その他](option/section-08.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/option.md の「その他」 |

## 実装箇所

- `crates/nanai-surface/src/parser/handlers/animation.rs:26` `} else if field_lower.starts_with("option") {`
- `src-tauri/src/ghost/scan/directory/filter.rs:21` `println!("🛠️ Developer option entry: {}", trimmed);`
- `ui/assets/LICENSE-3RD-PARTY.html:9452` `the Larger Work may, at their option, further distribute the Covered`
- `ui/ts/ui/renderers/inputs/input-helpers.ts:42` `const opt = document.createElement("option");`
- `tests/bind-menu.test.ts:37` `const option = bindOptionForScope(manifest, 0);`
- `crates/nanai-surface/src/parser/handlers/mod.rs:96` `apply_animation_line(&mut txt, &[0], "0.option", "exclusive");`
