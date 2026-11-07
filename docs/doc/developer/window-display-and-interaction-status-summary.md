# ウインドウ表示・インタラクション改善進捗まとめ (Status Summary)

本ドキュメントは、これまでに実施した機能修正・改善項目と、依然として残存しているウィンドウ表示課題の現在のステータスをまとめたものです。

---

## 1. 改善・実装完了項目 (Completed Improvements)

| 改善カテゴリ | 項目・修正内容 | 関連ファイル |
| :--- | :--- | :--- |
| **タスクバー DWM** | `skip_taskbar(false)` と `AppUserModelID` 共有による、全キャラのタスクバーサムネイルプレビュー連結化 | `src-tauri/src/commands/window/character_window.rs` |
| **描画二重化防止** | Tauri デスクトップモード時に `index.html` (メインウィンドウ) 内への不要な二重 DOM 描画を停止 | `ui/ts/surface/ghost-surface.ts` |
| **スコープターゲット分離** | スコープ0 (メイン), 1 (サブ), N (追加キャラ) の描画ターゲット (`char-display-N`) を固有分離し衝突を解消 | `ui/ts/surface/ghost-surface.ts`, `surface.ts` |
| **スナップ＆ツールチップ** | SSP 準拠のスナップ判定 (`Monitor`, `Character`, `Initial`)、`Ctrl` キー無効化、`coordsOnly` 座標表示 | `ui/ts/surface/interaction/drag/snap.ts` |
| **コンテキストメニュー** | スコープ別メニュー切替 (メイン29項目 / サブ5項目)、未設定時のサイドバー非表示化 | `ui/menu-iframe.html`, `ui/css/context-menu.css` |
| **アセットプリロード** | メニューテーマおよびバルーン画像の `Image` 事前デコードによる初回表示遅延・チラつきの低減 | `ui/ts/ui/renderers/menu-theme-renderer.ts`, `assets.ts` |

---

## 2. 依然として残存している課題 (Remaining Window Display Issues)

1. **High-DPI 環境での物理/論理サイズ・位置ミスマッチ**:
   - ディスプレイの拡大率 (125%, 150%, 200%) によって、ウィンドウフレーム枠の透過領域のサイズ計算や初期配置にズレが発生する可能性。
2. **キャラクター移動時のバルーンウィンドウ非同期追従**:
   - OS ネイティブドラッグ時、キャラクターウィンドウと吹き出しバルーンウィンドウの座標同期 (`sync_character_balloon`) にミリ秒単位のズレやもたつきが発生する場合がある。
3. **ウィンドウ枠（クロップ範囲）の最適化**:
   - サーフィス変更時に画像自然サイズ (`naturalWidth`, `naturalHeight`) へリサイズする際、透明余白枠のサイジング調整。

---

## 3. 次のステップ

- **DPI 座標系の統一**: Rust 側・TS 側での物理ピクセル (`PhysicalPosition` / `PhysicalSize`) と論理ピクセル (`LogicalPosition` / `LogicalSize`) の変換式を一元化。
- **ドラッグ中リアルタイム同期**: ウィンドウ移動イベント（`onMoved`）時のバルーン追従精度のさらなる向上。
