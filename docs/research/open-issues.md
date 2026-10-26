# Nanai Android Mascot - 課題・残タスク一覧 (Open Issues)

本ドキュメントは、Nanai Android Mascot の実装進捗に伴い洗い出された現在の課題・検討事項・未実装タスクをまとめたものです。

---

## 🚨 1. 不具合・安定性課題 (Bug & Stability)

### 1.1 Windows メッセージキューあふれエラー (Error code 0x80070718)

- **現象**:
  `PostMessage failed ; is the messages queue full? Error code 0x80070718 - このコマンドを実行するための十分なクォータがありません。` が開発環境での実行中に出力される。
- **原因と背景**:
  Windows の Win32 メッセージキュー上限（10,000 件）に達した際に WebView2 / Tauri ランタイムから発生する。マウス追従、座標監視、タイマー、あるいは IPC イベント（`emit` / `invoke`）の高頻度送信・リスナー多重登録が要因となる。
- **対策方針**:
  1. マウス移動（ドラッグ・部位追従・ヒットテスト）イベントの `requestAnimationFrame` または 16ms〜33ms 単位でのスロットリング（間引き）。
  2. 不要な IPC 通信の抑制（UI側で閉じる座標計算や DOM 更新は Rust を経由せず直接処理）。
  3. ゴースト再ロード・ウィンドウ生成時のイベントリスナー解除・再登録のクリーンアップ徹底。

---

## 🧩 2. SHIORI サブシステム & 規格対応課題 (SHIORI Subsystem)

### 2.1 C++ SHIORI 組み込みモジュール (`src-tauri/src/shiori/cpp.rs`) の整理

- **現状**:
  動的ローダー (`ShioriDynamicEngine`) により Windows DLL (32bit/64bit) および Linux/Android `.so` のロードが実現されたが、`src/shiori/cpp.rs` にスタブ（`SatoriyaEngine` 未実装等）や重複したステート管理が残存している。
- **対策方針**:
  - `ShioriDynamicEngine` への一本化、または静的リンク統合の目的・対象（WASM や特定環境向け）を明確化してリファクタリング。

### 2.2 SSTP / イベントパラメータ規格の完全準拠

- **現状**:
  主要イベント（`OnBoot`, `OnClose`, `OnMouseClick`, `OnChoiceSelect`, `OnSecondChange` 等）は動作しているが、細部パラメータ（Ref値）の規格適合度を向上させる余地がある。
- **対象項目**:
  - `OnSecondChange` / `OnMinuteChange`: `Reference3` (見切れ判定 0/1), `Reference4` (最小化状態) などのヘッダ追従。
  - `OnMouseMove`: カーソル追従・なで判定（`Reference4: 部位名`）の高精度化。

---

## 📱 3. モバイル・マルチプラットフォーム課題 (Platform & Mobile)

### 3.1 Android 常駐・オーバーレイ実装

- **現状**:
  デスクトップ互換コアが先行して動作中。Android 向けの常駐サービスおよび最前面オーバーレイ（`SYSTEM_ALERT_WINDOW`）は設計段階。
- **対策方針**:
  - Android 固有のバックグラウンド実行（Foreground Service）と通知領域連携の実装。
  - Android のジェスチャー操作とドッキング退避の最適化。

### 3.2 Linux / WASM 環境対応

- **現状**:
  Linux 向け `.so` 動的ロードの記述はあるが、CI / 実機での継続的テスト環境の整備が未完了。
- **対策方針**:
  - WebAssembly (WASM) SHIORI 実行環境のパッケージング（ブラウザ単体実行・セキュアサンドボックス向け）。

---

## 🎨 4. シェル・描画・UI 拡張課題 (Shell & UI)

### 4.1 レガシー画像フォーマット & バルーン定義

- **PNA 透過マスク**:
  24bit BMP + 8bit PNA マスクの合成処理の完全互換対応（現状はアルファ付き PNG を第一推奨）。
- **`descript.txt` 座標解釈**:
  レガシースキンの `origin.x` や 9スライス矩形の自動解釈。
