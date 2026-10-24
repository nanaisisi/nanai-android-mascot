# SHIORI 統合技術仕様

> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

## 概要

Android およびクロスプラットフォーム向け伺か（UKAGAKA）互換環境において、**[UKADOC (Ukagaka Documentation Project)](https://ssp.shillest.net/ukadoc/)** の公式仕様に準拠しつつ、Windows DLL 依存から脱却するための統合技術仕様。

## 背景と移植ステータス分析（2026年現状）

### 1. 公式エコシステムの移植ステータス

Ukagaka Tech Team（`ukatech`）および公式ドキュメントプロジェクト（`ukadoc`）を調査した結果、エコシステムの現状は以下の通りです：

- **公式仕様の基準**:
  - [ukatech/ukadoc-spec](https://github.com/ukatech/ukadoc-spec) - UKADOC 公式仕様書リポジトリ（さくらスクリプト、SHIORI 3.0 プロトコル、surfaces.txt 等の基幹仕様）
  - [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) - SSP 固有仕様・拡張リファレンスリポジトリ
  - Web 版公式マニュアル: [UKADOC Project (ssp.shillest.net/ukadoc/)](https://ssp.shillest.net/ukadoc/)
- **公式 SHIORI 実装の現状**:
  - 里々（`ukatech/satoriya-shiori`）や YAYA（`YAYA-shiori/yaya-shiori`）の公式リポジトリは、Windows / MSVC を主軸としつつ Linux/POSIX 向けビルドテスト等のクロスプラットフォーム化を進めている**「移植・整備の途上」**にある。
  - 公式リポジトリ単体での Android NDK / WebAssembly (WASM) 向けビルド済みパッケージや完全移植版はまだ提供されていない。

### 2. 本プロジェクトにおける解決戦略（3層ハイブリッド構造）

公式リポジトリが移植途上であることを前提とし、開発の停滞を防ぎつつ安定した動作を確保するため、以下の **3層多層フォールバック** を採用します。

```mermaid
flowchart TD
    Req[ユーザー操作 / タイマー発火] --> Router{SHIORI エンジンルーター}
    
    Router -->|優先度 1: 内蔵 JS/TS エンジン| L1[Layer 1: JavaScript 軽量 SHIORI<br>・WASM/ネイティブ不要で 100% 稼働<br>・モバイル省電力 & mock_nanai 即時対話]
    
    Router -->|優先度 2: C++ 直接組み込み / WASM| L2[Layer 2: C++ ソース統合 (里々 / YAYA)<br>・Android NDK / Rust build.rs 直接コンパイル<br>・または Emscripten WASM Worker]
    
    Router -->|優先度 3: Win32 DLL (Windows のみ)| L3[Layer 3: ネイティブ DLL 直接呼出<br>・Windows デスクトップ検証時の互換リファレンス]

    L1 --> Resp[さくらスクリプト応答]
    L2 --> Resp
    L3 --> Resp
```

---

## UKADOC 標準イベントとモバイル操作のマッピング仕様

[UKADOC SHIORI/3.0 Event](https://ssp.shillest.net/ukadoc/manual/spec_shiori3.html) に完全準拠したイベント送受信パイプラインを定義します。

| モバイル操作 | 送信 SHIORI イベント | ヘッダ・パラメータ仕様 (Reference) | 動作・備考 |
| :--- | :--- | :--- | :--- |
| **単発タップ（つつき）** | `OnMouseClick` | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0 (左クリック相当)`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID (head, bust等)` | `surfaces.txt` の Collision 矩形から逆算判定 |
| **スワイプ移動（なで）** | `OnMouseMove` | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID` | 一定回数・距離のストローク検知で「なで」反応 |
| **長押し（600ms）** | `OnMouseDoubleClick` または メニュー | `Reference4: 当たり判定ID` | 部位固有のダブルクリック応答、またはクラシックメニュー展開 |
| **定期タイマー** | `OnSecondChange` | `Reference0: 起動時からの秒数`<br>`Reference1: 重複不可フラグ`<br>`Reference2: 最小化中フラグ (0/1)` | 自発トーク（ランダムトーク）周期駆動 |
| **選択肢タップ** | `OnChoiceSelect` | `Reference0: 選択肢ID` (`\q[ラベル,ID]`) | スクリプト対話分岐の進行 |
| **起動・終了** | `OnBoot` / `OnClose` | `Reference0: シェル名` | 起動挨拶、終了前トーク処理 |

---

## 技術アーキテクチャ

### 1. ソースコード配置

```text
src/cpp/
├── satoriya-shiori/     # SATORI SHIORI (ukatech/satoriya-shiori submodule)
│   ├── satoriya/        # コアソース (POSIX/Windows 互換)
│   └── LICENSE          # BSD 2-Clause
└── yaya-shiori/         # YAYA SHIORI (YAYA-shiori/yaya-shiori submodule)
    ├── *.cpp            # 実装ファイル群
    ├── *.h              # ヘッダーファイル群
    └── LICENSE          # 修正BSD
```

### 2. 統合レイヤー構成

```text
JavaScript / WebView Layer
         ↕ (Tauri Commands / Events)
    Tauri Bridge (Rust)
         ↕ (Rust FFI & build.rs cc)
    C++ SHIORI Engine (里々 / YAYA)  OR  JS Fallback Engine
         ↕
    Ghost Files (descript.txt / 辞書ファイル)
```

### 3. インターフェース変換

#### 従来の DLL API

```c
HGLOBAL __declspec(dllexport) __cdecl request(HGLOBAL h, long *len);
BOOL __declspec(dllexport) __cdecl load(HGLOBAL h, long len);
BOOL __declspec(dllexport) __cdecl unload();
```

#### 新しい Rust FFI

```rust
extern "C" {
    fn shiori_request(input: *const c_char, len: usize) -> *mut c_char;
    fn shiori_load(ghost_path: *const c_char) -> bool;
    fn shiori_unload() -> bool;
}
```

## 実装段階

### Phase 1: 基本統合

1. **C++ビルド環境**: CMake/Cargo での統合ビルド
2. **FFI Bridge**: Rust-C++間の基本的なデータ交換
3. **最小動作**: 単純なリクエスト/レスポンス

### Phase 2: SHIORI 機能

1. **ゴーストローディング**: descript.txt 解析と SHIORI 初期化
2. **メッセージ処理**: SAKURA Script の処理とレスポンス生成
3. **状態管理**: セッション・変数の永続化

### Phase 3: 高度機能

1. **複数 SHIORI 対応**: SATORI・YAYA 等の切り替え
2. **プラグイン機能**: 追加 SHIORI の動的ロード
3. **パフォーマンス最適化**: メモリ管理・処理速度向上

## ビルド統合

### Cargo.toml 設定

```toml
[build-dependencies]
cc = "1.0"

[dependencies]
# FFI関連
libc = "0.2"
```

### build.rs スクリプト

```rust
use cc::Build;

fn main() {
    // SATORI SHIORI のビルド
    Build::new()
        .cpp(true)
        .files(&["src/cpp/satoriya-shiori/satoriya/*.cpp"])
        .compile("satori_shiori");

    // YAYA SHIORI のビルド
    Build::new()
        .cpp(true)
        .files(&["src/cpp/yaya-shiori/*.cpp"])
        .compile("yaya_shiori");
}
```

## データフロー

### 1. ゴースト初期化

```text
User Input → JavaScript → Tauri Command → Rust → C++ SHIORI Load
```

### 2. メッセージ処理

```text
User Click → JavaScript Event → Tauri Request → Rust FFI → C++ Process → Response
```

### 3. 状態同期

```text
SHIORI State ↔ Rust Storage ↔ JavaScript State ↔ UI Update
```

## セキュリティ考慮

### Android 固有制約

1. **ファイルアクセス**: アプリサンドボックス内でのファイル操作
2. **メモリ管理**: ネイティブコードでのメモリリーク対策
3. **権限管理**: 必要最小限の権限での動作

### 対策

1. **サンドボックス内実行**: アプリ専用ディレクトリでの動作
2. **RAII**: Rust の自動メモリ管理活用
3. **エラーハンドリング**: 安全な失敗処理

## ライセンス統合

### 本プロジェクト

- Apache 2.0 / MIT デュアルライセンス

### 組み込み SHIORI

- **SATORI**: BSD 2-Clause License
- **YAYA**: 修正 BSD ライセンス

### 統合時の注意

- 各ライセンスの著作権表示を維持
- 配布時のライセンス文書同梱
- ソースコード公開時の義務遵守

## パフォーマンス目標

### レスポンス時間

- SHIORI 初期化: < 1 秒
- メッセージ処理: < 100ms
- 状態保存: < 50ms

### メモリ使用量

- SHIORI : < 50MB
- キャッシュ: < 10MB
- UI 表示: < 30MB

## 将来拡張

### Web Extension 準拠

- 設定 API・ストレージ API 等の標準化
- クロスプラットフォーム対応

### VSCode Extension 参考

- 拡張機能アーキテクチャの応用
- プラグインシステムの実装
