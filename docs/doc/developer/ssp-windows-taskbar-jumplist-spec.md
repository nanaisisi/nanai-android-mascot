# SSP Windows タスクバー・ジャンプリスト仕様書

本ドキュメントは、SSP（Sakura Script Player）の Windows タスクバー右クリックメニューにおける「タスク (Tasks)」領域および所属アイテム（Explorer, Calendar）の正確な仕様書です。

---

## 1. SSP Windows タスクバー「タスク」構成 (2アイテム)

SSP の Windows タスクバー右クリックジャンプリストにおいて、「タスク (Tasks)」カテゴリ配下には以下の 2つの内蔵アイテムのみが登録・提供されます：

```
【Windows タスクバー 右クリックジャンプリスト】
 ┌────────────────────────────────────────┐
 │  タスク                                │
 │    Explorer (内部エクスプローラー)     │
 │    Calendar (カレンダー)               │
 └────────────────────────────────────────┘
```

### 1. Explorer (内部エクスプローラー)
- **機能**: SSP 内蔵のゴースト/シェル/アセット探索・管理ダイアログ（`explorer-modal-content`）を起動。インストール済みゴーストやシェルのプレビューと一覧管理をアプリケーション内部で直接行う。

### 2. Calendar (カレンダー)
- **機能**: カレンダーおよびスケジュール連携ダイアログ（`calendar-modal-content`）を起動。

---

## 2. 実装構造

1. **内蔵 UI ダイアログ (`ui/ts/ui/modal.ts`, `modal-ghost-handlers.ts`)**:
   - `explorer-modal-content`: 内部エクスプローラー UI の描画・リスナー管理。
   - `calendar-modal-content`: カレンダー UI の描画。
2. **フロントエンド連携 (`ui/ts/core/app-actions.ts`)**:
   - アクション `explorer`（内部エクスプローラー起動）および `calendar`（カレンダーダイアログ表示）のハンドリング。
