# sstp : Direct SSTP

- **規格**: [direct.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/direct/) (ukadoc-spec/spec/sstp/direct.md)
- **対応状況**: ✅ 実装済

## 突合結果

SSTP 受信機能なし。

## 実装箇所

- `crates/nanai-vfs/src/resolver/path_resolution.rs:23` `if let Some(direct) = self.resolve(relative_path)`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:24` `let direct = base.join(&normalized);`
- `ui/assets/LICENSE-3RD-PARTY.html:144` `&quot;control&quot; means (i) the power, direct or indirect, to cause the`
- `ui/ts/ui/spec-compliance-runner.ts:153` `const direct = styleObj?.[name];`
- `tests/wasm-shiori-loader.test.ts:83` `it("should handle direct load, request, suspend, resume and unload without worke`
- `crates/nanai-vfs/src/resolver/path_resolution.rs:24` `&& direct.is_file()`
