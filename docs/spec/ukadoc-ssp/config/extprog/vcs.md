# バージョン管理ツール

- **規格**: [extprog.md](../../../../ukadoc-ssp/config/extprog.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/extprog/))
- **検索語**: extprog, vcs, git
- **対応状況**: ⚠️ 一部対応

## 突合結果

バージョン管理ツールの指定設定は未実装。


## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs:18` `".git",`
- `ui/assets/LICENSE-3RD-PARTY.html:561` `<li><a href="https://github.com/awxkee/moxcms.git" target="_blank" rel="noopener`
- `ui/ts/ui/modal-settings-handlers.ts:128` `const useVcsForUpdate = getCheck("use-vcs-for-update");`
- `src-tauri/src/commands/install/archive/packaging.rs:28` `".git",`
- `ui/assets/LICENSE-3RD-PARTY.html:5621` `<li><a href="https://github.com/rust-cli/anstyle.git" target="_blank" rel="noope`
- `ui/ts/ui/templates/settings-templates.ts:113` `<label><input type="checkbox" id="use-vcs-for-update" /> 利用可能な場合は更新にバージョン管理ツールを使`
