# Rustへの移行検討の再検討 (Rust Migration Strategy Re-evaluation)

本プロジェクトにおける **Rust バックエンド（`../../../crates/ui`）** と **TypeScript / Kotlin フロントエンド・UI層** の役割分担および、今後の Rust 移行戦略について再検討した結果をまとめます。

---

## 1. 現在のアーキテクチャ概要

プロジェクトは現在、**ハイブリッド・アーキテクチャ**を採用しており、パフォーマンス・メモリ安全性・マルチプラットフォーム（Desktop / Mobile / Web）対応の観点から明確な責務分離が行われています。

```mermaid
graph TD
    subgraph Android / Tauri Frontend (TS / Kotlin / Compose)
        UI[UI Layers / WebView / Touch Handling] --> IPC[Tauri IPC Bridge]
    end

    subgraph Rust Core Engine (crates/ui)
        IPC --> Parser[Sakura Script Parser & AST]
        IPC --> Anim[Seriko Animation Scheduler & Compositor]
        IPC --> VFS[Virtual File System & Charset Decoding]
        IPC --> Shiori[SHIORI Protocol / SSTP / FMO]
    end
```

---

## 2. すでに Rust 化されているコア領域 (`../../../crates/ui`)

現在、以下の重い処理やコアロジックはすべて **高パフォーマンスかつメモリ安全な Rust** で実装されています：

1. **さくらスクリプト解析・AST構築** (`../../../crates/ui/src/script`)
   - トークナイザ、ASTビルダー、コマンドライフサイクル分類、括弧タグハンドラー（`raiselike`, `underscore`, `basic`）。
2. **SERIKO アニメーションエンジン & サーフィス合成** (`../../../crates/ui/src/animation`, `surfaces/`)
   - タイムライン構築、イージング、アニメーションスケジューラー、動的当たり判定（Collision）、サーフィスレイヤー合成（Chromakey / Blend modes）、フレームバッファ。
3. **ファイルシステム・文字コード処理** (`../../../crates/ui/src/vfs`)
   - VFSオーバーレイ、SJIS / EUC-JP / UTF-8 / UTF-16 自動文字コード検出・デコード。
4. **SHIORI プロトコル & SSTP / FMO** (`../../../crates/ui/src/shiori`, `sstp/`, `fmo/`)
   - SHIORI リクエスト/レスポンスパーサ、マルチステージローダー、FMO共有メモリバッファ生成。

---

## 3. レガシー 32-bit SHIORI DLL ローダーに関する考察 (Windows Architecture & Proxy Strategy)

伺か（Ukagaka）のエコシステムにおいて、サードパーティ製ゴースト（YAYA, 里々, 華和梨, 各種C++製SHIORI）の多くは歴史的経緯から **Windows 32-bit (x86) DLL** としてビルドされています。

### A. 64-bit プロセスからの直接ロードの壁

- 現代の主要な開発・実行環境（Windows x86_64 の 64-bit Rust/Tauri アプリケーション）において、64-bit プロセスが 32-bit DLL を直接 `LoadLibrary` (`libloading`) することは **Windows OS のアーキテクチャ制約により不可能** です（32bitプロセス空間と64bitプロセス空間の混在不可）。

### B. 採用すべき解決アプローチ（プロキシ/ブリッジ設計）

将来的に Windows デスクトップ環境でレガシーな 32-bit SHIORI DLL をサポートする場合、以下のアーキテクチャ設計についての言及・備えをドキュメントおよびローダー層に残すことが重要です：

1. **Out-of-Process 32-bit Helper Proxy (`nanai-shiori-proxy-32.exe`)**:
   - メインの 64-bit Rust バックエンドから、独立した 32-bit プロセス（小さなヘルパー実行ファイル）を子プロセスとして起動する。
   - 64-bit 側と 32-bit 側で IPC（Named Pipe、ローカル TCP、または標準入出力 JSON-RPC）を確立し、SHIORI リクエスト/レスポンスのやり取りを仲介する。
2. **WASM / 64-bit Native Migration (YAYA/Satori source interpretation)**:
   - 可能であれば、バイナリDLLではなくソーススクリプトを 64-bit Rust / WASM インタープリタ（`wasmi`）で直接解釈・実行するモダンなルートを優先案内する。
3. **明確なエラーメッセージング**:
   - 64-bit 環境で 32-bit DLL を直接ロードしようとした際に、サイレント失敗させず、「32-bit SHIORI DLL は 64-bit プロセスから直接ロードできません。32-bit プロキシヘルパーが必要です」という明確な診断ログと対応策をユーザー/開発者に提示する。

---

## 4. 今後の Rust 移行・統合の検討事項 (Re-evaluation Points)

### A. WebView / DOM レンダリング層の扱い

- **現状**: UI描画、コンテキストメニュー、タッチジェスチャー認識、ダイアログ等は TypeScript (`../../../ui/ts`) および Android Compose (`nanai-android-mascot`) で実装。
- **評価**: UI層は頻繁なビューの変更やプラットフォーム固有のAPI（Android Native / WebView）に依存するため、**TypeScript / Kotlin (Compose) に維持するのが最も開発生産性と保守性が高い**。

### B. SHIORI DLL / 外部プラグイン実行のホスティング

- **現状**: Rust バックエンド側で SHIORI プロトコル（YAYA / KAWARI / などのネイティブ/WASMモジュール）のロード・通信抽象化基盤を整備中。
- **方向性**: 将来的により高度なサンドボックス化やクロスプラットフォーム（Android上でのWASM/ネイティブSHIORI実行）を進める場合、SHIORI ローダー層の Rust 側での完全カプセル化を深化させる。

---

## 5. 推奨ロードマップと戦略

1. **コアロジックの Rust 完結を維持**: パーサ、アニメーション、VFS、SHIORI 通信は引き続き Rust (`../../../crates/ui`) を唯一の真実の源（Single Source of Truth）とする。
2. **IPCの型安全性強化**: TypeScript 側と Rust 側の IPC コマンド（Tauri Commands）間での型定義の自動同期（Specta または ts-rs 等の導入検討）。
3. **テスト駆動の維持**: 現在達成している高水準のカバレッジ（Rust 288テスト、TS 154ファイル / 570テスト全通過）を維持し、リファクタリング時の安全性を担保する。
