# SSP ウィンドウ・キャラクタースナップ推測仕様

実機検証（SSP）および実装突合から整理した、キャラクターウィンドウのドラッグ時スナップと境界枠の推測仕様です。

## 1. 判定枠の定義

| 枠種別 | 定義 | 主な用途 |
| :--- | :--- | :--- |
| `initial` 枠 | ウィンドウ外枠（`outerPosition` / `outerSize`） | `Initial` スナップ判定・外枠オーバーレイ表示 |
| `character` 枠 | サーフェス画像の非透明ピクセル最小外接矩形 | `Monitor` / `Character` スナップ判定・キャラ枠オーバーレイ表示 |

## 2. スナップ優先順位（X/Y 軸独立）

`Ctrl` キー押下中はすべてのスナップを一時無効化します。通常時は各軸独立で次の優先順位により吸着先を決定します。

1. **`Initial`（最優先）**:
   - **X 軸（1キャラ目 / `scope 0`）**: 自 `initial` 枠右端を現在モニターの `work_area`（タスクバー・Dock 除外領域）右端へスナップします。
   - **X 軸（Nキャラ目 / `N >= 2`）**: 自 `initial` 枠右端を前キャラクター（`N - 1`）の `initial` 枠左端へスナップします。
   - **Y 軸（全キャラクター共通）**: 自 `initial` 枠下端を現在モニターの `work_area` 下端へスナップします。初期配置座標（起動時の位置）には依存しません。
2. **`Monitor`**: `Initial` に一致しない軸について、`character` 枠の上下左右端を `work_area` 上下左右端へスナップします。
3. **`Character`**: `Initial` / `Monitor` に一致しない軸について、`character` 枠の上下左右端を他キャラクターウィンドウの `character` 枠上下左右端へスナップします。

## 3. 座標ポップアップ（`#coord-popup`）表示仕様

- 1行目: `<x>,<y>` に続けて、スナップしている軸のみを括弧書きで表示します（例: `1363,842 (Snap X:Initial)` / `1363,842 (Snap X:Character, Snap Y:Monitor)` / `1363,842`）。
- 2行目: `Press Ctrl to disable`

## 4. 関連実装

- スナップ計算・共通ヘルパー: [snap.ts](../../../ui/ts/surface/interaction/drag/snap.ts)
- メインウィンドウドラッグ: [drag-motion.ts](../../../ui/ts/surface/interaction/drag/drag-motion.ts) / [drag-pointer-up.ts](../../../ui/ts/surface/interaction/drag/drag-pointer-up.ts)
- サブキャラウィンドウ制御: [character.ts](../../../ui/ts/surface/character.ts)
- 当たり判定・境界オーバーレイ描画: [collision-overlay-renderer.ts](../../../ui/ts/surface/collision-overlay-renderer.ts)
