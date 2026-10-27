# エクスプローラ機能仕様

- **規格**: [ukadoc-ssp/functions/explorer](https://github.com/ukatech/ukadoc-ssp/blob/main/functions/explorer/index.md)
- **対応状況**: ⚠️ 部分対応

## 目的

インストール済みゴーストを表形式で確認し、名前・作者名・パス・`\0` 名・`\1` 名を見ながら対象を切り替える。SSP のエクスプローラを既存のモーダル UI 上に実装する。

## 一覧項目

| 列 | データ | 対応 |
| --- | --- | --- |
| 名前 | `GhostInfo.name` | ✅ |
| 作者名 | `GhostInfo.craftman` | ✅ |
| パス | `GhostInfo.path` | ✅ |
| グループ | 現在の走査結果には未保持 | ⚠️ `—` |
| インストール日時 | インストール履歴未保持 | ⚠️ `—` |
| 更新日時 | 更新履歴未保持 | ⚠️ `—` |
| 更新結果 | 更新履歴未保持 | ⚠️ `—` |
| `¥0名` | `GhostInfo.sakura_name` | ✅ |
| `¥1名` | `GhostInfo.kero_name` | ✅ |

## 実装済み操作

- エクスプローラを「機能・ツール」サブメニューから開く
- 現在のゴーストを初期選択
- 行クリックによる選択
- 行ダブルクリックまたは「切り替え」によるゴースト切替
- 名前・作者名・パスの検索
- 検索結果の次候補への移動
- 列見出しの昇順・降順ソート
- 再読み込み
- 閉じる

## 未対応・今後の拡張

- `group`、インストール日時、最終更新日時、更新結果の永続化
- 種類メニューによるバルーン・シェル・プラグイン一覧への切替
- 複数選択（Ctrl/Shift）
- 右クリック機能メニュー、コピー、全選択
- ネットワーク更新結果の行単位反映
- 起動時にエクスプローラを自動表示する設定

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js`: 表と操作 UI
- `ui/js/ui/modal-ghost-handlers.js`: 走査、検索、ソート、切替
- `ui/js/core/app-actions.js`: `explorer` アクション
- `ui/menu-iframe.html`: 「機能・ツール」サブメニュー項目
- `ui/css/menu-modal.css`: 表示スタイル
