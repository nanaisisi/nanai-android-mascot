# Nanai WASM 移行および最適化計画

本計画は、Nanai Android Mascot において残存している TypeScript の高負荷ロジック（サーフェス画像合成、アニメーションフレーム制御、SSTP/FMOプロトコル、インストール/アップデート処理）を完全に Rust (WASM) へ移行し、フロントエンドの責務を純粋なUI描画とブラウザ/Androidブリッジに限定するための網羅的な実行計画です。

## 概要

すでにパーサー群（さくらスクリプト、`surfaces.txt`, `descript.txt`）や基本再生エンジン (`SakuraPlayerEngine`) の Rust/WASM 化は完了しています (`crates/nanai-core`)。本計画では残るドメインの完全移行と、Web Worker による非同期化・メモリ管理最適化を行います。

## User Review Required

> [!IMPORTANT]
>
> - 本移行により、TypeScript 側のレガシーな画像合成ロジックやプロトコル処理コードが削除され、すべての計算が `nanai-core` (Rust/WASM) に集約されます。
> - ブラウザ版・Android版ともに、高負荷な処理が WASM / Web Worker にオフロードされるため、UIスレッドの応答性が大幅に向上します。

## Open Questions

- なし（既存のアーキテクチャ設計書および移行方針に準拠）

## Proposed Changes

### 1. サーフェス合成・アニメーション制御の WASM 統合 (Phase 4)

- **概要**: `crates/nanai-core/src/surface_compositor.rs` および `seriko_animation.rs` のロジックを TypeScript 側 (`ui/ts/core/wasm/wasm-surface.ts` および `surface-render.ts`) から呼び出すブリッジを完成させ、TS 側のレガシー合成・アニメーションコードを削除する。
- **対象ファイル**:
  - [MODIFY] [wasm-surface.ts](ui/ts/core/wasm/wasm-surface.ts)
  - [DELETE] [ui/ts/surface/compositor/](ui/ts/surface/compositor/)
  - [DELETE] [ui/ts/surface/animation/](ui/ts/surface/animation/)

### 2. SSTP・FMO・各種プロトコルの WASM 統合 (Phase 5)

- **概要**: `crates/nanai-core/src/sstp_fmo.rs`, `install_protocol.rs`, `update_protocol.rs` の機能を TypeScript 側 (`ui/ts/core/wasm/wasm-protocol.ts`) に完全接続し、TS側の残存アクションスタブを削除する。
- **対象ファイル**:
  - [MODIFY] [wasm-protocol.ts](ui/ts/core/wasm/wasm-protocol.ts)
  - [DELETE] [sstp-fmo-actions.ts](ui/ts/core/actions/sstp-fmo-actions.ts)

### 3. パフォーマンス最適化 (Web Worker & メモリ管理)

- **概要**: 重いWASM処理（SHIORI読み込み、画像一括合成、大規模スクリプトパース）を Web Worker (`shiori-worker.ts`) 上で動作させるよう非同期化し、`FinalizationRegistry` によるメモリ解放の堅牢化を行う。
- **対象ファイル**:
  - [MODIFY] [wasm-memory.ts](ui/ts/core/wasm/wasm-memory.ts)
  - [MODIFY] [shiori-worker.ts](ui/ts/ghost/shiori-worker.ts)

### 4. テストスイートの整理と検証

- **概要**: 移行完了した機能に対応する古い TypeScript 単体テストを削除し、Rust 側の `cargo test` および TypeScript 側の WASM 統合テスト (`wasm-bridge.test.ts`) を実行する。

## Verification Plan

### Automated Tests

- Rust 側単体テスト: `cargo test`
- フロントエンド統合・WASMテスト: `npm run test` (Vitest)
- 型チェック: `npm run typecheck`

### Manual Verification

- デスクトップ版 (Tauri) および Web版の起動、ゴーストの表示、さくらスクリプト再生、着せ替え・アニメーションの正常動作確認。
