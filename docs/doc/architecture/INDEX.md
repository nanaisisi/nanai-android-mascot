# Rust / WASM 大部分移行計画：目次とドキュメント構造

本フォルダ内の設計ドキュメントは、「**概案** ➔ **各論 (1〜5)** ➔ **総論**」の明確な論理構造で構成されています。

---

## 1. 概案（概要・背景・検討アジェンダ）
- **[rust-migration-overview.md](./rust-migration-overview.md)**：概案  
  - プロジェクトの現状、課題、移行がもたらす価値、および各論のアジェンダ。

---

## 2. 各論（個別の技術テーマ深掘り）
- **[rust-migration-api-extensibility.md](./rust-migration-api-extensibility.md)**：各論1  
  - API活用と拡張性・改変性の統合設計（`web-sys`、IPC統合、モジュールクレート分離）。
- **[rust-migration-memory.md](./rust-migration-memory.md)**：各論2  
  - WASMにおけるメモリ管理とゼロコピー（Zero-Copy）戦略（ポインタ共有、WebWorker解体）。
- **[rust-migration-ecs.md](./rust-migration-ecs.md)**：各論3  
  - Bevy-ECS にインスパイアされたデータ指向エンジン（Arekaモデル）。
- **[rust-boundary-responsibilities.md](./rust-boundary-responsibilities.md)**：各論4  
  - Web側 (TS) ⇔ WASM (Rust) ⇔ アプリ側 (Native Rust) の3層境界と明確な役割分担。
- **[rust-wasm-tradeoffs.md](./rust-wasm-tradeoffs.md)**：各論5  
  - WASM 採用における課題・制約（`shrink` 不在）と Native Rust オフロード比較。

---

## 3. 総論（総合結果・最終結論・ロードマップ）
- **[rust-migration-summary.md](./rust-migration-summary.md)**：総論  
  - 各論（1〜5）の検討結果の統合、ハイブリッドアーキテクチャの最終決定、および段階的移行ロードマップ。
