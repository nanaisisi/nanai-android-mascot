# ウインドウモード

- **規格**: [windowmode.md](../../../../docs/ukadoc-ssp/functions/windowmode.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/windowmode/))
- **対応状況**: ⚠️ 一部対応

デスクトップ常駐 / モバイルフローティングオーバーレイ表示による代替

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [2つの表示方式](windowmode/section-01.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「2つの表示方式」 |
| [ウインドウモードにする](windowmode/section-02.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「ウインドウモードにする」 |
| [「操作」メニューを開く](windowmode/section-03.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「「操作」メニューを開く」 |
| [「操作」メニューの項目](windowmode/section-04.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「「操作」メニューの項目」 |
| [バックログの統合](windowmode/section-05.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「バックログの統合」 |
| [タスクバーと最小化](windowmode/section-06.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「タスクバーと最小化」 |
| [キーボードショートカット](windowmode/section-07.md) | ⚠️ 一部対応 | docs/ukadoc-ssp/functions/windowmode.md の「キーボードショートカット」 |

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:24` `"baseware.windowmode" => "normal",`
