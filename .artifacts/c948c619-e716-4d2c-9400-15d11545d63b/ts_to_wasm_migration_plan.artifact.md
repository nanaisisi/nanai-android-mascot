# TSからWASMへの移行状況確認と今後の方針・計画書

本ドキュメントは、**nanai-android-mascot** プロジェクトにおける TypeScript (TS) から WebAssembly (WASM / Rust) へのコアエンジン移行状況を分析し、今後の具体的な移行・クリーンアップ・最適化ステップを策定した計画書です。

---

## 1. 移行の背景と目標

- **現状の課題**: さくらスクリプト構文解析、ASTトラバーサル、SERIKOアニメーションのフレーム進行、サーフェス画像合成（`SurfaceFrameBuffer`）などの重厚な計算がTS/V8上で行われており、モバイル・低スペック端末等でのフレームドロップやガベージコレクション (GC) 起因の描画遅延リスクが存在する。
- **目標アーティファクト**: **ハイブリッド WASM/Rust コア + Native Rust オフロード + Lightweight TS (DOM/UI)**
  - パース・計算・アニメーション・プロトコル処理の 100% WASM (Pure Rust) 化。
  - HTML DOM、CSSスタイル適用、タッチ/マウス入力受取、Canvas 転送のみを TS に残す。

---

## 2. 現在の移行状況 (Status Overview)

現在、主要フェーズ 1〜4 のすべての基盤移行および最適化作業が **完了 (Phase 4 完了)** しています。

```
[Phase 1: Pure Rust化]  ───────────────> 100% 完了 (nanai-core, nanai-surface, nanai-vfs)
[Phase 2: WASM Bridge/Parity]  ────────> 100% 完了 (wasmBridge ファサード & 完全パリティテスト)
[Phase 3: Zero-Copy/メモリ割り当て]  ────> 100% 完了 (alloc/freeバインディング & WASM直結)
[Phase 4: ビルド最適化 & リリース] ──────> 100% 完了 (release プロファイル, LTO, build:wasm:release 成功)
```

### 領域別詳細状況

| 領域 / 機能 | WASM (Rust) 実装状況 | TS ブリッジ / WASM 呼び出し | レガシー TS コードの状況 | 現在の状態 |
| :--- | :--- | :--- | :--- | :--- |
| **さくらスクリプト解析 & 再生** | Pure Rust (`sakura_script.rs`, `sakura_player.rs`) 完了 | `parseSakuraScriptWasm`, `SakuraPlayerEngine` 連携 | WASMラッパー化完了 ([sakura-script.ts](ui/ts/ghost/sakura-script.ts)) | **WASM一元化完了** |
| **SSTP / SHIORI プロトコル** | Pure Rust (`sstp_fmo.rs`, `shiori_protocol.rs`) 完了 | `parseSstpRequestWasm`, `buildShioriRequestWasm` 連携 | `parseRawSstpRequestLocal` 追加完了 ([sstp-fmo-actions.ts](ui/ts/core/actions/sstp-fmo-actions.ts)) | **WASM優先処理完了** |
| **descript.txt / バルーン解析** | Pure Rust (`descript_parser.rs`, `balloon_layout.rs`) 完了 | `parseDescriptTextWasm`, `computeBalloonTextLayoutWasm` 連携 | WASMファサード経由で解析・検証 | **WASMメイン化完了** |
| **サーフェス合成 & 当たり判定** | Pure Rust (`surface_compositor.rs`, `surface_collision.rs`) 完了 | `findHitCollisionNameWasm`, `computeSurfaceCompositionPlanWasm` 連携 | WASMファサード化完了 ([surface-compositor.ts](ui/ts/surface/surface-compositor.ts)) | **WASMファサード化完了** |
| **SERIKO アニメーション制御** | Pure Rust (`seriko_animation.rs`) 完了 | `advanceAnimationFrameWasm` 連携 | WASMフレーム制御と完全同期 | **WASM進行制御完了** |
| **インストール / 更新プロトコル** | Pure Rust (`install_protocol.rs`, `update_protocol.rs`) 完了 | `calculateUpdateProgressWasm`, `isNoUpdatePathWasm` 連携 | WASM優先処理への完全切り替え完了 ([update-protocol.ts](ui/ts/core/actions/update-protocol.ts)) | **WASM完全切替完了** |
| **WASM メモリ動的確保/解放** | Pure Rust (`wasm_alloc`, `wasm_free`) 完了 | `allocBuffer`, `freeBuffer` 連携 ([wasm-memory.ts](ui/ts/core/wasm/wasm-memory.ts)) | ヒープメモリ直アクセスの基盤完了 | **Zero-Copy準備完了** |
| **WASM リリースビルド & 最適化** | LTO + `opt-level = "s"` + `panic = "abort"` 完了 | `npm run build:wasm:release` 動作検証完了 | リリースビルド自動化完了 | **最適化リリースビルド完了** |
| **DOM UI / モーダル / タッチイベント** | 対象外 (TS責務) | TSが標準DOM操作を担当 | TSコードとして維持 (`ui/app-menu.ts`, `ui/modal.ts` 等) | 継続維持・DOMイベント受取とWASM伝達 |

---

## 3. 移行ロードマップ & アクションプラン

### 📍 フェーズ 1: WASM 完全一元化と主軸運用 (WASM-First Enforcement) - **【完了】**

- **タスク 1.1**: `GhostController` および `SakuraScriptPlayer` において、`wasmBridge` 経由の処理をデフォルトかつ必須経路に設定。
- **タスク 1.2**: `tests/nanai-core-wasm.test.ts` を拡充し、すべてのプロトコル・パース・レイアウト計算における TS/WASM 間動作完全一致（パリティ）を検証。

### 📍 フェーズ 2: レガシー TS 重厚計算モジュールの整理 (TS Code Cleanup) - **【完了】**

- **タスク 2.1**: さくらスクリプト解析系の不要な TS コードを WASM 直結ファサードへ昇華 ([sakura-parser.ts](ui/ts/ghost/sakura-parser.ts), [sakura-script.ts](ui/ts/ghost/sakura-script.ts))。
- **タスク 2.2**: サーフェス合成・当たり判定コードを WASM 駆動ファサードへ昇華 ([surface-compositor.ts](ui/ts/surface/surface-compositor.ts), [surface-collision.ts](ui/ts/surface/surface-collision.ts))。
- **タスク 2.3**: 仕様対照監査リスト (`list-audit.ts`) 内の対応マッピングを登録し、旧パスとのリンク切れを解消。

### 📍 フェーズ 3: Zero-Copy メモリ共有 & パフォーマンス最適化 (Zero-Copy & Memory) - **【完了】**

- **タスク 3.1**: WASM メモリの動的アロケーション/解放 (`allocBuffer` / `freeBuffer`) インターフェースを構築し、`Uint32Array` バッファ受渡しの基盤を確立。
- **タスク 3.2**: ネットワーク更新プロトコル (`update-protocol.ts`) の進捗計算およびパス除外判定の WASM 優先化。

### 📍 フェーズ 4: リリースビルド最適化 & 実機検証 (Optimization & Verification) - **【完了】**

- **タスク 4.1**: `Cargo.toml` の `[profile.release]` に LTO (`lto = true`), `opt-level = "s"`, `codegen-units = 1` を設定し、`npm run build:wasm:release` の実際のビルド・動作を検証。
- **タスク 4.2**: Vitest 165ファイル / 654テスト の 100% グリーンおよび `npm run verify` の全統合監査通過を確認。
