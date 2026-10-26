# SHIORI 統合技術仕様

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **さくらスクリプト (Sakura Script)**: [ukadoc-spec: さくらスクリプト](https://ukatech.shillest.net/ukadoc-spec/spec/sakura-script/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **バルーン仕様 (Balloon)**: [ukadoc-spec: balloon](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

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
  - 里々（src/cpp/satoriya-shiori / 公式マニュアル: [ukatech/satori-docs](https://github.com/ukatech/satori-docs)）
  - YAYA（src/cpp/yaya-shiori / 公式マニュアル: [YAYA-shiori/yaya-docs](https://github.com/YAYA-shiori/yaya-docs)）
  - 華和梨（src/cpp/kawari / [ukatech/kawari](https://github.com/ukatech/kawari)）
  - 各公式リポジトリは、Windows / MSVC を主軸としつつ Linux/POSIX 向けビルドテスト等のクロスプラットフォーム化を進めている**「移植・整備の途上」**にある。
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

| モバイル操作             | 送信 SHIORI イベント                 | ヘッダ・パラメータ仕様 (Reference)                                                                                                                                 | 動作・備考                                                 |
| :----------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **単発タップ（つつき）** | `OnMouseClick`                       | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0 (左クリック相当)`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID (head, bust等)` | `surfaces.txt` の Collision 矩形から逆算判定               |
| **スワイプ移動（なで）** | `OnMouseMove`                        | `Reference0: X座標`<br>`Reference1: Y座標`<br>`Reference2: 0`<br>`Reference3: 0 (sakura) / 1 (kero)`<br>`Reference4: 当たり判定ID`                                 | 一定回数・距離のストローク検知で「なで」反応               |
| **長押し（600ms）**      | `OnMouseDoubleClick` または メニュー | `Reference4: 当たり判定ID`                                                                                                                                         | 部位固有のダブルクリック応答、または右クリックメニュー展開 |
| **定期タイマー**         | `OnSecondChange`                     | `Reference0: 起動時からの秒数`<br>`Reference1: 重複不可フラグ`<br>`Reference2: 最小化中フラグ (0/1)`                                                               | 自発トーク（ランダムトーク）周期駆動                       |
| **選択肢タップ**         | `OnChoiceSelect`                     | `Reference0: 選択肢ID` (`\q[ラベル,ID]`)                                                                                                                           | スクリプト対話分岐の進行                                   |
| **起動・終了**           | `OnBoot` / `OnClose`                 | `Reference0: シェル名`                                                                                                                                             | 起動挨拶、終了前トーク処理                                 |

---

## 技術アーキテクチャ

### 1. ソースコード配置

```text
src/cpp/
├── satoriya-shiori/     # SATORI SHIORI (ukatech/satoriya-shiori submodule)
│   ├── satoriya/        # コアソース (POSIX/Windows 互換)
│   └── LICENSE          # BSD 2-Clause
├── yaya-shiori/         # YAYA SHIORI (YAYA-shiori/yaya-shiori submodule)
│   ├── *.cpp            # 実装ファイル群
│   ├── *.h              # ヘッダーファイル群
│   └── LICENSE          # 修正BSD
└── kawari/              # 華和梨 KAWARI (ukatech/kawari submodule)
    ├── *.cpp / *.h      # KIS インタプリタ実装
    └── LICENSE          # BSD 3-Clause
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

### 3. インターフェース仕様（公式実装のエクスポート仕様）

#### 従来の Windows DLL API

```c
HGLOBAL __declspec(dllexport) __cdecl request(HGLOBAL h, long *len);
BOOL __declspec(dllexport) __cdecl load(HGLOBAL h, long len);
BOOL __declspec(dllexport) __cdecl unload();
```

#### POSIX / WASM / C++ 直接リンク時の API (公式実装準拠)

公式リポジトリ（`satoriya-shiori`, `yaya-shiori`, `kawari`）の POSIX / Emscripten 実装では、Windows の `GlobalAlloc` / `GlobalFree` の代わりに標準の `malloc` / `free` またはバッファポインタ渡しが採用されています。

- **`load(char* h, long len) -> int`**:
  - `h`: ゴーストディレクトリの絶対パス（Shift_JIS または UTF-8、末尾セパレータ付き）を格納したメモリバッファ。
  - **重要**: POSIX版の実装（YAYA等）では、渡された `h` を SHIORI 内部で `free(h)` する仕様になっているため、Rust/呼び出し元は `libc::malloc` で確保したポインタを渡す必要があります。
- **`request(char* h, long* len) -> char*`**:
  - `h`: `GET SHIORI/3.0` 等のリクエスト文字列バッファ。
  - 戻り値: SHIORI レスポンス文字列へのポインタ。処理完了後、呼び出し元が `free` または SHIORI 側の規約に従って解放。
- **`unload() -> int`**:
  - 辞書や仮想マシンの解放を行い、終了コード（1: 成功）を返却。

#### Rust FFI バインディング仕様

```rust
use std::os::raw::{c_char, c_int, c_long};

extern "C" {
    /// SHIORI 初期化 (ghost path を渡す)
    pub fn load(h: *mut c_char, len: c_long) -> c_int;

    /// SHIORI プロトコル要求処理
    pub fn request(h: *mut c_char, len: *mut c_long) -> *mut c_char;

    /// SHIORI 終了・解放
    pub fn unload() -> c_int;
}
```

## 実装段階

### Phase 1: 基本統合

1. **C++ビルド環境**: CMake / Cargo `cc` クレートによるサブモジュール直接ビルド
2. **FFI Bridge**: Rust-C++ 間のメモリ管理（`malloc`/`free`）および文字コード変換（UTF-8 ↔ CP932）
3. **最小動作**: `load` → `request("GET SHIORI/3.0...")` → `unload` パイプライン

### Phase 2: SHIORI 機能

1. **ゴーストローディング**: `descript.txt` 解析（`shiori` 定義に基づくディスパッチ）
2. **メッセージ処理**: SakuraScript のパースとバルーン表示キューの同期
3. **状態管理**: セッション・変数の永続化およびセーブデータ保護

### Phase 3: 多層フォールバック & プラグイン

1. **エンジン自動切替**: SATORI / YAYA / KAWARI / JS フォールバックの透過切り替え
2. **WASM サンドボックス & 外部ゴースト動的ロード**:
   - **非アプリ同梱（外部配布・動的追加）**: Win32 DLL 代替として WASM (.wasm) を採用。Android の dlopen() 制限やアーキテクチャ差分（ARM64/x86）を単一バイナリで吸収し、サンドボックス内で安全に隔離実行する。
   - **本体同梱 SHIORI**: アプリ本体に内蔵する標準エンジンは NDK 直接リンク（.so）や JS エンジンで最高速・省電力を両立。
3. **パフォーマンス最適化**: メモリ使用量と起動遅延の削減

## ビルド統合仕様

公式リポジトリの makefile（`makefile.emscripten`, `makefile.posix`）およびソース構成に基づき、`build.rs` または CMakeLists.txt を構成します。

### Cargo.toml 設定

```toml
[build-dependencies]
cc = "1.0"

[dependencies]
libc = "0.2"
encoding_rs = "0.8"
```

### build.rs スクリプト仕様（各 SHIORI のコンパイル）

```rust
use cc::Build;

fn main() {
    // ターゲット OS が Windows ネイティブ DLL を使う場合以外は C++ ソースから直接コンパイル
    #[cfg(feature = "native-shiori")]
    {
        // 1. YAYA SHIORI のビルド
        // 公式 yaya-shiori/makefile.emscripten / makefile.posix 準拠
        Build::new()
            .cpp(true)
            .flag_if_supported("-std=c++11")
            .define("POSIX", None)
            .include("src/cpp/yaya-shiori")
            .include("src/cpp/yaya-shiori/babel")
            .files(&[
                "src/cpp/yaya-shiori/aya5.cpp",
                "src/cpp/yaya-shiori/ayavm.cpp",
                "src/cpp/yaya-shiori/basis.cpp",
                "src/cpp/yaya-shiori/babel/babel.cpp",
                "src/cpp/yaya-shiori/ccct.cpp",
                "src/cpp/yaya-shiori/comment.cpp",
                "src/cpp/yaya-shiori/crc32.c",
                "src/cpp/yaya-shiori/duplevinfo.cpp",
                "src/cpp/yaya-shiori/file.cpp",
                "src/cpp/yaya-shiori/file1.cpp",
                "src/cpp/yaya-shiori/function.cpp",
                "src/cpp/yaya-shiori/globalvariable.cpp",
                "src/cpp/yaya-shiori/lib.cpp",
                "src/cpp/yaya-shiori/lib1.cpp",
                "src/cpp/yaya-shiori/localvariable.cpp",
                "src/cpp/yaya-shiori/log.cpp",
                "src/cpp/yaya-shiori/logexcode.cpp",
                "src/cpp/yaya-shiori/manifest.cpp",
                "src/cpp/yaya-shiori/md5c.c",
                "src/cpp/yaya-shiori/misc.cpp",
                "src/cpp/yaya-shiori/mt19937ar.cpp",
                "src/cpp/yaya-shiori/parser0.cpp",
                "src/cpp/yaya-shiori/parser1.cpp",
                "src/cpp/yaya-shiori/selecter.cpp",
                "src/cpp/yaya-shiori/sha1.c",
                "src/cpp/yaya-shiori/sysfunc.cpp",
                "src/cpp/yaya-shiori/value.cpp",
                "src/cpp/yaya-shiori/valuesub.cpp",
                "src/cpp/yaya-shiori/wsex.cpp",
                "src/cpp/yaya-shiori/posix_utils.cpp",
            ])
            .compile("yaya_shiori");
    }
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
