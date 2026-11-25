# 時計合わせ

- **規格**: [conn1.md](../../../../ukadoc-ssp/config/conn1.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/conn1/))
- **検索語**: sntp, clock
- **対応状況**: ✅ 実装済

## 突合結果

SNTP/HTTP サーバによる時刻合わせおよび自動実行間隔の設定は未実装。


## 実装箇所

- `src-tauri/src/shiori/property/evaluator/rules/system_cpu.rs:10` `"clock" => get_cpu_clock_mhz().to_string(),`
- `ui/ts/core/actions/menu-action-system.ts:68` `if (action === "sntp") {`
- `ui/ts/ui/submenu-renderer.ts:233` `{ action: "sntp", label: "時刻合わせ (N)", shortcut: "" },`
- `tests/command-handler-boost.test.ts:78` `it("system/target.js covers biff, sntp, and open targets", async () => {`
- `ui/ts/ghost/command-handler/media.ts:214` `case "sntp": {`
- `ui/ts/ui/renderers/menu-caption-general-part2.ts:189` `id: "sntp-btn",`
