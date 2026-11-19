# `balloons*s.txt / balloonk*s.txt / balloonp*def*s.txt / balloonc*s.txt`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloons0s.txt, balloonk0s.txt, parse_balloon_options_text
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるサーフェス別個別設定ファイル群（対応 ID のサーフェスに対して `descript.txt` の記述を上書き適用し、入力ボックスにも `balloonc*s.txt` を使用する仕様）に対し、一部のみ対応している。

- `balloons*s.txt` / `balloonk*s.txt`: `balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs:198-275`) が `balloons0s.txt` / `balloonk0s.txt` / `balloonss.txt` / `balloonks.txt` / `balloons<id>s.txt` 等を読み込んで `descript.txt` に上書きマージし、`parse_balloon_options_text` (`crates/nanai-core/src/balloon_descript.rs:137`) も実装されている。ただし `surface_id` 指定時は `{prefix}{surf}{sid}s.txt` という仕様外の命名を探索し、`balloons.txt` / `balloonk.txt` / `balloonss.txt` / `balloonks.txt` など仕様外の候補も併せて参照する差異がある。
- `balloonp*def*s.txt`: `balloon_manifest` (`src-tauri/src/commands/shell/balloon.rs:219,249-253`) は `sid == 1` (`balloonk`) とそれ以外 (`balloons`) の 2 系統にのみ分岐しており、`balloonp*def*s.txt` は未探索・未実装。
- `balloonc*s.txt`: `balloon_manifest` および入力ボックス実装 (`ui/ts/ghost/command-handler/inputbox.ts`, `communicatebox.ts`, `teachbox.ts`) で未参照・未実装。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:198` `let option_files = vec![`
- `src-tauri/src/commands/shell/balloon.rs:219` `let prefix = if sid == 1 { "balloonk" } else { "balloons" };`
- `src-tauri/src/commands/shell/balloon.rs:222` `format!("{}{}{}s.txt", prefix, surf, sid),`
- `src-tauri/src/commands/shell/balloon.rs:256` `format!("{}2s.txt", prefix),`
- `src-tauri/src/commands/shell/balloon.rs:261` `vec![format!("{}{}s.txt", prefix, b), format!("{}s.txt", prefix)]`
- `crates/nanai-core/src/balloon_descript.rs:137` `pub fn parse_balloon_options_text(content: &str) -> BalloonOptionsManifest {`
- `crates/nanai-core/src/balloon_descript.rs:178` `fn test_parse_balloon_options() {`
