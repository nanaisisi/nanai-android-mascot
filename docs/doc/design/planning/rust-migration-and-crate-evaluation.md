# Rust側へのコード移行および外部クレート・ライブラリ利用検討書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **サーフィス合成 / アニメーション / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本ドキュメントは、**nanai-android-mascot** の長期保守性、パフォーマンス、型安全性、および Android / WASM / デスクトップ間のクロスプラットフォーム動作を最大化するため、現在フロントエンド（JavaScript / DOM / Canvas）で実装されている処理の **Rust側へのコード移行計画**、および各処理領域における **外部クレート（外部ライブラリ）の選定・比較・導入方針** をまとめたものです。

---

## 1. 移行の背景と基本方針

### 1.1 移行の目的

1. **二重実装（JS / Rust）の解消と保守の一元化**:
   - `surfaces.txt` やさくらスクリプトのパース、SHIORI プロトコル送受信など、フロントエンド（JS）と Rust（`crates/ui` / `src-tauri`）の両方にロジックが存在する領域を一元化し、単一の信頼できる情報源（Single Source of Truth）を確立する。
2. **パフォーマンスとメモリ効率の最大化**:
   - モバイル端末（Android）における Canvas 画像合成（クロマキー、PNAアルファマスク、レイヤーブレンド）の処理負荷を削減し、CPU/GPU バッテリー消費を抑える。
   - SIMD やゼロコピーメモリ参照を活用し、重いピクセル処理を Rust 側で実行する。
3. **安全なメモリ・サンドボックス実行**:
   - サードパーティ製ゴースト（ Win32 DLL 向けに作られた歴史的アセット）を、Android や Web 環境でクラッシュや脆弱性なく安全に実行するための WASM ランタイム基盤を確立する。
4. **WebView 責務のスリム化**:
   - WebView は「ユーザー入力イベントの受信」「DOM / Canvas への最終描画」のみを担当し、すべてのドメインロジック・プロトコル処理・データ変換を Rust コアに集約する。

### 1.2 移行設計の原則

- **Zero-Copy / Low-Copy**: Rust と JS 間のデータ転送で不要な JSON シリアライズやバッファコピーを避ける（WASM 線形メモリ参照やバイナリ転送）。
- **クロスプラットフォーム互換性**: Native Desktop (Windows/Linux/macOS), Android NDK (aarch64), WebAssembly (wasm32) の各ターゲットでビルド可能なクレートを選定する。
- **推移的依存の最小化**: 重大な依存関係ツリーを引き込むクレートを避け、ライセンス（MIT / Apache-2.0 互換）およびバイナリフットプリントを厳格に審査する。

---

## 2. モジュール別移行計画と外部クレート選定・比較

### 2.1 サーフィス画像合成・PNAアルファマスク・クロマキー処理

#### 現状の実装

- フロントエンドの `ui/js/surface/compositor/`（`chromakey.js`, `layer.js`, `compose.js`）において、HTML5 `<canvas>` と 2D コンテキスト (`ImageData`) を用いて左上ピクセル色によるクロマキー透過や PNA マスクのアルファ合成を行っている。
- 一部 `Uint32Array` による 32-bit キャスト高速化が施されているが、JavaScript の GC やスレッド制限、モバイルブラウザでの Canvas メモリ確保が制約となる。

#### 移行方針 (Rust 化)

- サーフィス合成レイヤーを Rust 側の独立モジュール（または `nanai-surface` クレート）に移行。
- 合成済みの画像バッファ（RGBA8888）をキャッシュし、フロントエンドへは Raw ピクセルまたは画像 URL として渡す。

#### 外部クレート比較検討

| クレート名           | 利点                                                                                                                                                | 欠点 / 課題                                                                                              | 採用判定                                                                            |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **`image`**          | ・PNG/BMP のデコード・エンコードが標準対応<br>・ピクセル操作 API が豊富で枯れている<br>・Pure Rust で Android/WASM 互換                             | ・機能が多岐にわたり依存関係がやや大きい<br>・ブレンド処理（Porter-Duff 等）は手動または別クレートが必要 | **採用（必須）**<br>PNG/PNA/BMP デコードおよび基本ピクセルバッファとして最適        |
| **`tiny-skia`**      | ・Skia 互換の高品質な 2D ソフトウェアレンダラ<br>・Porter-Duff 合成モード（Overlay, Multiply, Add 等）を標準サポート<br>・`no_std` 互換で軽量・高速 | ・ベクター描画中心のため単純なビットマップブレンドには過剰な面がある                                     | **準推奨**<br>複雑なブレンドモード (`blend`, `add`, `overlay`) の忠実再現に活用可能 |
| **`bytemuck`**       | ・ゼロコストでのスライス型キャスト（`&[u8]` ↔ `&[u32]`）<br>・アライメント安全性がコンパイル時に保証される<br>・WASM / SIMD との親和性が極めて高い  | ・データ変換のみの低レベルクレート                                                                       | **採用（推奨）**<br>ピクセルバッファの高速操作・エンディアン変換用                  |
| **`resvg` / `usvg`** | ・SVG レンダリングに優れる                                                                                                                          | ・伺かのビットマップ合成用途には不要                                                                     | **不採用**                                                                          |

**推奨構成**: `image` (PNG/PNA読込・フォーマット変換) + `bytemuck` (ゼロコピー走査・クロマキーSIMD)

---

### 2.2 さくらスクリプト & surfaces.txt パーサー

#### 現状の実装

- `ui/js/ghost/sakura-tokenizer.js`, `sakura-command-handler.js`, `ui/js/surface/surface-parser.js` などの JS 実装と、`crates/ui/src/script/`, `crates/ui/src/surfaces/` の Rust 実装が存在する二重管理状態。
- JS 側はフォールバックとして残されているが、文法規則の更新時に同期漏れが発生しやすい。

#### 移行方針 (Rust 化)

- すべてのパース処理を `crates/ui` に一本化。
- JS 側は Rust から返される AST または正規化されたコマンドキュー（`SakuraCommand`）を再生するランタイム（Player）に特化する。

#### 外部クレート比較検討

| クレート名                        | 利点                                                                                                                               | 欠点 / 課題                                                                      | 採用判定                                                                 |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Rust 標準 (`std::str::Chars`)** | ・依存クレートゼロ<br>・現行の `crates/ui` で既に実装・テスト済み（113+ 件）<br>・コンパイル時間・バイナリサイズ最小               | ・複雑なエスケープや文脈依存文法の記述量が増える                                 | **現状維持・採用**<br>現行のゼロ依存パーサーが高速・安定しているため継続 |
| **`winnow`**                      | ・Rust 最速クラスのストリーミングコンビネータ<br>・`nom` より優れたエラーメッセージと保守性<br>・WASM/Android で問題なくビルド可能 | ・導入に伴うパーサー全体の書き直しコスト<br>・わずかな依存関係の増加             | **次期候補**<br>将来的に構文が複雑化した際の最適化として保留             |
| **`logos`**                       | ・正規表現から高速な字句解析機（DFA）を自動生成<br>・トークナイズ速度が極めて高速                                                  | ・さくらスクリプトのような文脈依存（`\` エスケープや多値引数）では状態管理が煩雑 | **不採用**                                                               |
| **`pest`**                        | ・PEG 文法ファイルによる直感的な定義                                                                                               | ・実行速度がコンビネータより劣る<br>・バイナリサイズが大きい                     | **不採用**                                                               |

**推奨構成**: 現行の **Rust 標準手書きパーサー（`crates/ui`）を主軸** とし、JS 側の独自パースロジックを段階的に廃止して Rust の `parse_sakura_script` / `parse_surfaces_txt` へ一本化。

---

### 2.3 SHIORI 実行サンドボックス (WASM / ネイティブ DLL)

#### 現状の実装

- デスクトップ環境では `src-tauri/src/shiori/cpp.rs`（C++ 静的リンク / FFI）および `dynamic/host.rs`（`libloading` による DLL ロード）。
- ブラウザ/非同梱環境では `ui/js/ghost/shiori-worker.js` による Web Worker 内の簡易 JS SHIORI または将来の WASM 呼び出し。

#### 移行方針 (Rust 化)

- サードパーティ製 Win32 SHIORI（里々, YAYA, 華和梨）の WASM コンパイル成果物を、フロントエンドの Web Worker ではなく **Rust 側の組み込み WASM ランタイム** で統一管理・実行する。
- これにより、デスクトップ・Android 双方で同一の WASM サンドボックス（メモリ隔離・クラッシュ保護）を提供可能になる。

#### 外部クレート比較検討

| クレート名       | 利点                                                                                                                                                                           | 欠点 / 課題                                                                                                                | 採用判定                                                                         |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **`wasmi`**      | ・Pure Rust の WebAssembly インタープリタ<br>・`no_std` 動作可能でプラットフォーム非依存<br>・JIT 不可の iOS や一部 Android 環境でも確実に動作<br>・メモリ消費量が極めて少ない | ・JIT コンパイラに比べて純粋な計算性能は劣る（ただし SHIORI は文字列入出力が主であり十分高速）                             | **本命（採用推奨）**<br>Android / モバイル環境での確実なポータビリティと省メモリ |
| **`wasmtime`**   | ・Bytecode Alliance 公式の最高速 WASM JIT ランタイム<br>・WASI サポートが充実                                                                                                  | ・Cranelift JIT 依存のため Android ARM でのクロスコンパイルや環境設定が極めて重い<br>・バイナリサイズが巨大                | **不採用（モバイル向けには重量過大）**                                           |
| **`libloading`** | ・Win32 `.dll` / Linux `.so` の直接動的ロード<br>・最高速度                                                                                                                    | ・Windows デスクトップでのみ利用可能<br>・Android ではセキュリティ制約（`dlopen` 制限）によりサードパーティ DLL は実行不可 | **デスクトップ専用フォールバックとして継続**                                     |

**推奨構成**: モバイル/配布ゴースト向けに **`wasmi`** を採用し、同梱 C++ SHIORI（里々/YAYA）は NDK/cc 静的リンク、デスクトップは `libloading` を併用。

---

### 2.4 仮想ファイルシステム (VFS) & アーカイブ展開 (NAR / ZIP)

#### 現状の実装

- `src-tauri/src/commands/install/archive/` にて `zip` クレートと `encoding_rs` を用いて Shift_JIS ファイル名やテキストをデコード・展開。
- パスの大文字・小文字揺らぎ（Case Insensitivity）の解決は Rust 側 `vfs.rs` にて部分的に実装。

#### 移行方針 (Rust 化)

- ゴーストの全ファイルツリーをインメモリまたは SQLite / LMDB などの軽量キーバリューストアにマッピングし、OS のファイル I/O 頻度を半減させる。

#### 外部クレート比較検討

| クレート名            | 利点                                                                                           | 欠点 / 課題                                                          | 採用判定                     |
| :-------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :--------------------------- |
| **`zip` (現行: 9.x)** | ・`deflate` 対応、枯れた標準<br>・既存コードで Zip Slip 対策済み                               | ・ストリーミング解凍でメモリ効率が良い                               | **継続採用**                 |
| **`encoding_rs`**     | ・Mozilla 製の高速 Shift_JIS / CP932 デコーダー<br>・SIMD 最適化あり                           | ・必須要件（ukadoc 規格適合）                                        | **継続採用**                 |
| **`memmap2`**         | ・大容量アーカイブやサーフィス画像のメモリマップド I/O<br>・読み込み遅延と物理メモリ消費の削減 | ・Android の Scoped Storage や権限によっては mmap の挙動に配慮が必要 | **検討（大容量アセット用）** |

---

## 3. 

現在の `src-tauri/Cargo.toml` および `crates/ui/Cargo.toml` において、冗長または最新の Rust 2024 標準機能で代替可能なクレートを整理します。

### 3.1 廃止・置換対象

1. **`once_cell` の完全廃止**:
   - Rust 2024 (1.70+) では `std::sync::LazyLock` および `std::sync::OnceLock` が標準化されたため、外部クレートとしての `once_cell` はすべて標準ライブラリへ置換する。
2. **`sys-locale` の整理**:
   - `crates/ui` でのシステムロケール取得は、WebView 側の `navigator.language` または Tauri の OS 設定から引数渡しする設計に統一し、外部クレート依存を排除する。
3. **`regex` の利用箇所削減**:
   - 単純な区切り文字分割（カンマ区切り、改行、プレフィックス判定）に `regex` が使われている箇所を `std::str::split` やスライス走査へリファクタリングし、バイナリサイズと初期化コストを削減する。

---

## 4. ワークスペース再編とクレート分割構想

将来的な WASM ビルドおよび Android ARM 単体ビルドへの対応を見据え、以下のようなクレート分割を段階的に推進します。

```text
Cargo.toml (workspace)
├── src-tauri/                 # Tauri アプリケーション本体・OS 連携ブリッジ
│   ├── Cargo.toml
│   └── src/
├── crates/
│   ├── ui/                    # フロントエンド向け型定義・UI 仲介層 (現行)
│   ├── nanai-core/            # 純粋 Rust ロジック (no_std 互換 / WASM 対応)
│   │   ├── parser/            # surfaces.txt / sakura script / descript.txt
│   │   └── protocol/          # SHIORI 3.0 プロトコル
│   ├── nanai-surface/         # 画像合成・PNA・クロマキー・SIMD ピクセル処理
│   │   └── dependencies: image, bytemuck
│   ├── nanai-shiori-vm/       # wasmi による WebAssembly SHIORI サンドボックス
│   │   └── dependencies: wasmi
│   └── nanai-vfs/             # Shift_JIS 対応アーカイブ展開・ファイルキャッシュ
│       └── dependencies: zip, encoding_rs
```

---

## 5. 段階的移行ロードマップ

| フェーズ                     | 移行対象・タスク                                                                                                                          | 使用クレート        | 期待効果                               |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------------------------------------- |
| **Phase A** (即時)           | ・`crates/ui` のテスト・警告修正<br>・`once_cell` → `LazyLock` 置換<br>・JS/Rust パーサー二重実装の解消（JSパーサーの Rust コール一本化） | 標準ライブラリ      | 保守性向上・バグ防止                   |
| **Phase B** (画像処理)       | ・Canvas での PNA/クロマキー合成を Rust へ移行<br>・合成結果のピクセルキャッシュ実装                                                      | `image`, `bytemuck` | モバイル描画パフォーマンス向上・省電力 |
| **Phase C** (サンドボックス) | ・`wasmi` による WASM SHIORI ランタイムの Rust コア組み込み<br>・サードパーティゴーストの安全な実行環境構築                               | `wasmi`             | Android でのサードパーティゴースト対応 |
| **Phase D** (ワークスペース) | ・クレート分割（`nanai-core`, `nanai-surface`, `nanai-shiori-vm`）の実施                                                                  | ワークスペース設定  | ビルド時間短縮・WASM 移植性確立        |

---

## 6. 関連ドキュメント相互参照

- [次期フェーズ実装計画 & 統合技術仕様書 (Phase 2+)](implementation-plan-and-spec.md)
- [Android OSシステム連携とRustクレート整理の検討実行計画](../cache-and-async/android-system-and-crate-cleanup-plan.md)
- [Web / WASM / Rustクレート連携アーキテクチャ設計](../cache-and-async/web-wasm-rust-integration-spec.md)
- [Androidキャッシュ階層構造と非同期アーキテクチャ設計](../cache-and-async/android-cache-and-async-architecture.md)
