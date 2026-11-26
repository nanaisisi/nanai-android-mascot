> **AI 関与について**: このドキュメントは Antigravity の支援により作成されました。設計前提（単一ゴースト・複数キャラクター）および優先順位はオーナーユーザーと AI の協議により決定されています。

# SHIORI 対応検討・実行アーキテクチャ設計（単一ゴースト複数キャラクター前提）

Nanai Android Mascot における SHIORI（および SAORI / MAKOTO）の実行方式・互換戦略・段階的実装ロードマップを定義します。

関連ドキュメント:
- [shiori-runtime-and-dynamic-module-policy.md](shiori-runtime-and-dynamic-module-policy.md)
- [ゴースト-shiori-の読込み・代替戦略.md](../nas-spec/shiori-script/plugin-and-shiori-fallback-spec/ゴースト-shiori-の読込み・代替戦略.md)
- [baseware-comparison-plan.md](../research/baseware-comparison-plan.md)
- [android-window-architecture.md](../nam-spec/android-window-architecture.md)
- [android-unified-overlay.md](../nam-spec/android-unified-overlay.md)
- [android-native-overlay-study.md](../nam-spec/android-native-overlay-study.md)
- [native-architecture-study.md](native-architecture-study.md)

---

## 1. 前提方針とスコープ

### 1.1 単一ゴースト・複数キャラクターモデル

本設計では、同時アクティブなゴースト（SHIORI インスタンス）を **単一ゴースト（1 インスタンス）** に限定し、1 つのゴーストが持つ **複数キャラクタースコープ（`\0` / `\1` / `\p[N]`）** を駆動するモデルを採用します。

- **SHIORI 層**: 同時にロード・稼働する SHIORI エンジンは常に 1 つとする。
- **キャラクター表現層**: SHIORI が返却するさくらスクリプト内の `\0`（さくら側）・`\1`（うにゅう側）・`\p[N]`（追加キャラクター）をパースし、Windows ではマルチウィンドウ、Android では統合オーバーレイ／キャラクタービュー（[android-window-architecture.md](../nam-spec/android-window-architecture.md) / [android-unified-overlay.md](../nam-spec/android-unified-overlay.md)）へディスパッチする。

### 1.2 単一ゴースト前提による設計上の利点

| 観点 | 単一ゴースト前提のメリット |
| :--- | :--- |
| **C++ グローバル状態の衝突回避** | YAYA / 里々 / 華和梨の既存 C++ 実装が持つグローバル変数・静的状態を複数ゴースト間で分離する必要がなくなる |
| **ゴースト切替時のクリーンな解放** | 切替時は現行インスタンスを確実に `unload` / 破棄してから次をロードする直列フローに集中できる |
| **Android メモリ / LMK 耐性** | 複数 SHIORI 辞書・ヒープの同時常駐を防ぎ、Low Memory Killer (LMK) リスクを抑えられる |
| **SAORI / FMO 連携の単純化** | 呼び出し元 SHIORI が常に一意であるため、SAORI シムや状態管理のルーティングが単純になる |

---

## 2. 現状の実装実態と既存方針とのギャップ

[shiori-runtime-and-dynamic-module-policy.md](shiori-runtime-and-dynamic-module-policy.md) で規定されている方針に対し、現在のコードベースは以下の状態です。

| 層 | 主な実装ファイル | 現状 |
| :--- | :--- | :--- |
| **Windows DLL ロード** | [engine.rs](../../../src-tauri/src/shiori/dynamic/engine.rs) / [build.rs](../../../src-tauri/build.rs) | **稼働可能**（64bit `libloading`、`loadu` 優先探索、`shiori-host32.exe` による 32bit DLL ブリッジ） |
| **C++ 統合（YAYA / 里々 / 華和梨）** | [build.rs](../../../src-tauri/build.rs) / [cpp.rs](../../../src-tauri/src/shiori/cpp.rs) / [mod.rs](../../../src-tauri/src/shiori/mod.rs) | **スタブ段階**（`cpp/` に C++ ソースは存在するが、`build.rs` は `yaya_rust_interface_stub.cpp` のみビルドし、`shiori/mod.rs` からは未接続） |
| **WASM SHIORI** | [wasm.rs](../../../src-tauri/src/shiori/wasm.rs) / [lib.rs](../../../crates/nanai-shiori-vm/src/lib.rs) | **モック段階**（固定レスポンス返却のみで、WebView V8 の `WebAssembly.instantiate` ブリッジは未接続） |
| **Android 動的ロード** | [engine.rs](../../../src-tauri/src/shiori/dynamic/engine.rs) | **未実装**（`target_os = "android"` では `Err(LibraryLoadAndroid)` を返す） |

---

## 3. 既存ベースウェアの SHIORI アプローチ比較

詳細な調査は [baseware-comparison-plan.md](../research/baseware-comparison-plan.md) に基づき別途深掘りしますが、SHIORI 実行観点での主な参照ポイントは以下の通りです。

| ベースウェア | 主な SHIORI 実行方式 | 本作で参照する設計観点 |
| :--- | :--- | :--- |
| **SSP (BUGFIX)** | Win32/64 DLL 直接ロード（`loadu` / `load`） | ライフサイクル・SAORI / MAKOTO 呼び出し規約の基準 |
| **ninix-kagari / ninixw** | POSIX `.so` / 独自インタープリタ / プロキシ / 必要時 Wine | DLL 名と実態からネイティブ代替エンジンへマッピングする判定ロジック |
| **Utatane / Ourin** | macOS 向け `.dylib` 移植版（YAYA / 里々 / 華和梨 等） | POSIX 移植時の文字コード・パス区切り・SAORI 処理 |
| **pono-droid** | Android 上でのネイティブ/移植エンジン実行 | Android ストレージ制約下の辞書読込・セーブデータ永続化 |
| **Ikagaka / Engawa** | ブラウザ上で WASM / JS 実装 SHIORI ＋ 仮想 FS | WebView V8 WASM 実行時の非同期 I/O・仮想 FS・セーブ書き戻し |
| **areka** | Rust ベースでの DLL ロード＋モダン連携（MCP 等） | 将来の外部プロセス / AI 連携型 SHIORI 拡張の参考 |

---

## 4. 実行アーキテクチャ設計（単一ゴースト前提）

### 4.1 プラットフォーム別の主力実行方式

| 対象プラットフォーム | 主力実行方式 | 補助 / フォールバック方式 |
| :--- | :--- | :--- |
| **Windows** | `libloading`（64bit）＋ `shiori-host32`（32bit）によるネイティブ DLL 直接実行 | 内蔵ネイティブエンジン / V8 WASM（非 Windows 互換テスト・Windows First 検証用） |
| **Android** | **APK 同梱のエンジン別 `.so`（`jniLibs` 経由 `dlopen` / `dlclose`）** | V8 WASM（外部配布・旧バージョン固定・サンドボックス実行用）、フォールバック会話 |
| **Web** | WebView (V8) 上の `WebAssembly.instantiate`（WASM）＋ JS ブリッジ | フォールバック会話 |

### 4.2 Android で「エンジン別同梱 `.so`（`dlopen` / `dlclose`）」を推す理由

[shiori-runtime-and-dynamic-module-policy.md](shiori-runtime-and-dynamic-module-policy.md) では「静的リンク」と「同梱 `.so`」の 2 案を比較していますが、**単一ゴースト前提**においては **エンジン別同梱 `.so`（`libsatori.so`, `libyaya.so`, `libkawari.so` 等）＋ `dlopen` / `dlclose`** の相性が特に優れます。

1. **エンジン間シンボル衝突の完全回避**: YAYA・里々・華和梨は共通の SHIORI エントリポイント（`load` / `unload` / `request`）を持つため、同一バイナリへ静的リンクするより `.so` を分離する方がラッパー保守が容易。
2. **ゴースト切替時の完全な状態リセット**: ゴースト切替時に `unload` 後 `dlclose()` を呼ぶことで、C++ 側のグローバル変数・静的キャッシュ・ヒープを確実に解放できる。
3. **Google Play 規約（W^X / DCL）への完全適合**: APK 内の `jniLibs/`（`/data/app/.../lib/arm64/`）に配置された `.so` の `dlopen` は OS・ストア規約に完全適合する（将来的な DFM 分割にも対応可能）。
4. **V8 WASM との補完関係**: 外部ゴーストが特定旧バージョンの SHIORI や独自 WASM（`shiori.wasm`）を要求する場合は、WebView V8 上の WASM インスタンスで隔離実行し、ネイティブ `.so` 側を汚さない。

---

## 5. SHIORI 一覧と対応方針マトリクス

一次参照元: [Ukagaka Tech Team (ukatech.shillest.net)](https://ukatech.shillest.net/) / [偽SiReFaSo (shiori カテゴリ)](https://nikolat.github.io/sirefaso/shiori/)

### 5.1 Ukagaka Tech Team (`ukatech.shillest.net`) 掲載 SHIORI（全7種）

| SHIORI | リポジトリ | 言語・ライセンス | 特徴・主なファイル | Windows | Android | Nanai 優先度 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **YAYA** (`Yet Another AYA`) | [YAYA-shiori/yaya-shiori](https://github.com/YAYA-shiori/yaya-shiori) | C++ / BSD-3-Clause（`cpp/yaya-shiori` 同梱済） | C 風構文・SAORI 動作可・`yaya.dll` / `yaya.txt` / `yaya_variable.cfg`（`loadu` 対応） | DLL 直接 + 内蔵検証 | 同梱 `.so` (`libyaya.so`) | **Tier 1（最優先・現役シェア最大）** |
| **里々** (`Yet Another SATORI`) | [ukatech/satoriya-shiori](https://github.com/ukatech/satoriya-shiori) | C++ / BSD-2-Clause（`cpp/satoriya-shiori` 同梱済） | 台本形式・`satori.dll` / `satori_conf.txt` / `dic*.txt`（`ssu` 依存強） | DLL 直接 + 内蔵検証 | 同梱 `.so` (`libsatori.so`) + `ssu` シム | **Tier 1（最優先・`mock_nanai` 垂直貫通）** |
| **華和梨** (`KAWARI`) | [ukatech/kawari](https://github.com/ukatech/kawari) | C++ / BSD-2-Clause（`cpp/kawari` 同梱済） | プログラマブル準AI・KIS・SHIORI/2.x & 3.0・`shiori.dll` / `kawarirc.kis` / `kawari.ini` | DLL 直接 + 内蔵検証 | 同梱 `.so` (`libkawari.so`) | **Tier 1（優先・定番3大エンジン）** |
| **powershiori** | [ukatech/powershiori](https://github.com/ukatech/powershiori) | PowerShell / リポジトリ参照 | 純粋 PowerShell 製 SHIORI/3.0・`ps12exe` で DLL 化・`.dic.ps1` | DLL 直接（Windows PowerShell 依存） | 非対応（未対応通知＋フォールバック） | **Windows のみ互換** |
| **蒼空** (`aosora-shiori` / チーム外提供) | [kanadelab/aosora-shiori](https://github.com/kanadelab/aosora-shiori) | C++ / リポジトリ参照 | 新世代 SHIORI・デモゴースト・VS Code 拡張あり | DLL 直接 | 同梱 `.so` または V8 WASM | **Tier 2（次期対応）** |
| **Pasta**（チーム外提供） | [ekicyou/pasta](https://github.com/ekicyou/pasta) | Rust / MIT | 日本語 Pasta DSL 辞書を Lua に変換して実行（Rust 製で移植親和性高） | DLL 直接 / Rust 統合候補 | 同梱 `.so` または Rust 統合 / WASM | **Tier 2（次期対応・Rust 親和性高）** |
| **湊** (`Minato` / チーム外提供) | [mizuki-yura/minato](https://github.com/mizuki-yura/minato) | Rust / MIT | `.mnt` ファイルにセリフとロジックを同一ブロック記述（ベータ版・Rust 製） | DLL 直接 / Rust 統合候補 | 仕様安定後に同梱 `.so` / Rust 統合検討 | **Tier 2〜3（仕様追従・Rust 親和性高）** |

### 5.2 コミュニティ OSS SHIORI（偽SiReFaSo `#ukagaka-shiori` 等）

| SHIORI | リポジトリ | 言語・ライセンス | 特徴 | Windows | Android | 扱い方針 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AYA5** | [ponapalt/aya5-shiori](https://github.com/ponapalt/aya5-shiori) | C++ / ライセンス要確認 | 旧 plain AYA5＋小修正（`aya5.dll` / `aya.txt`） | DLL 直接（`shiori-host32` 含む） | YAYA 互換代替（または必要時 `.so` 検証） | **互換代替対象** |
| **kagari_shiori** | [Tatakinov/kagari_shiori](https://github.com/Tatakinov/kagari_shiori) | C++ / MIT | Lua ベース SHIORI | DLL 直接 | `.so` または WASM 検討 | **Tier 3（検討対象）** |
| **kotori** | [Tatakinov/kotori](https://github.com/Tatakinov/kotori) | Lua / リポジトリ参照 | Lua 実装系 SHIORI | DLL / ブリッジ経由 | Lua ランタイム検討 | **Tier 3（検討対象）** |
| **phiori** | [Tatakinov/phiori](https://github.com/Tatakinov/phiori) | C / LGPL-3.0 | Python 3 ベース SHIORI（LGPL・Python ランタイム依存） | DLL 直接 | 非推奨（サイズ・LGPL・Python 依存） | **Windows のみ / 対象外** |
| **quickshiori** | [cronfox/quickshiori](https://github.com/cronfox/quickshiori) | C++ / リポジトリ参照 | JS ランタイムベース SHIORI（開発中・unstable） | DLL 直接 | WebView JS / WASM 側で代替検討 | **動向注視** |
| **dnproxy** | [nikolat/dnproxy](https://github.com/nikolat/dnproxy) | C# / CC0-1.0 | .NET Framework SHIORI | DLL 直接（.NET Framework 依存） | 非対応（未対応通知＋フォールバック） | **Windows のみ互換** |
| **nashi-shiori-studio-2** | [ukagaka-irono/nashi-shiori-studio-2](https://github.com/ukagaka-irono/nashi-shiori-studio-2) | JavaScript / リポジトリ参照 | JS ベース SHIORI / 制作関連 | WebView JS 連携検討 | WebView JS 連携検討 | **Web/JS 互換調査対象** |

### 5.3 レガシー / クローズドソース SHIORI

| SHIORI | 状況・制約 | 主なファイル | Windows | Android | 扱い方針 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AYA4 以前（旧文）** | 開発終了・旧仕様（SHIORI 2.x〜3.0） | `aya.dll` | DLL 直接（`shiori-host32`） | 非対応（未対応通知＋フォールバック） | **Windows のみ互換** |
| **美坂（Misaka）** | 開発停止・クローズドソース | `misaka.dll`, `misaka.txt` | DLL 直接（`shiori-host32`） | 非対応（未対応通知＋フォールバック） | **Windows のみ互換** |
| **その他独自・マイナー DLL（独自 C++ / アセンブラ / .NET 等）** | Windows API 依存・ソース非公開が多い | 任意 `*.dll` | DLL 直接（32bit/64bit） | 非対応（未対応通知＋フォールバック） | **Windows のみ互換** |

### 5.4 Web / 次世代拡張 SHIORI（クロスプラットフォーム共通）

| 形式 | 実行基盤 | 主なファイル / 指定 | 用途・位置づけ |
| :--- | :--- | :--- | :--- |
| **WASM SHIORI** | WebView (V8) `WebAssembly.instantiate` | `shiori,*.wasm` | 外部追加ゴースト、旧バージョン隔離、Web 版共通ランタイム |
| **JS SHIORI** | WebView (V8) JavaScript ブリッジ | `shiori,*.js` | 軽量カスタムゴースト、Web 試作、フォールバック辞書実行 |
| **外部プロセス / プロトコル連携型（MCP 等）** | IPC / ローカルブリッジ（将来拡張） | 設定ベース | AI・外部ツール連携型ゴースト向け（`areka` 等の動向を参照） |

### 5.5 エンジン自動判定ルール

`descript.txt` の `shiori,` 行は汎用名（`shiori.dll` 等）であるケースが多いため、以下の多段判定を行います。

| 優先度 | 判定材料 | 判定例 |
| :--- | :--- | :--- |
| 1 | 明示拡張子 / 独自指定 | `*.wasm` → WASM、`*.js` → JS エンジン |
| 2 | 同梱設定ファイル・辞書特徴 | `satori_conf.txt` / `dic*.txt` → 里々、`yaya.txt` / `aya.txt` / `yaya_variable.cfg` → YAYA、`kawarirc.kis` / `kawari.ini` → 華和梨、`.dic.ps1` → powershiori、`*.mnt` → 湊、Pasta 関連ファイル → Pasta、`misaka.txt` → 美坂 |
| 3 | DLL ファイル名・メタデータ | `satori.dll`、`yaya.dll` / `aya5.dll` / `aya.dll`、`misaka.dll` 等、またはバイナリ内文字列シグネチャ |

---

## 6. SAORI / MAKOTO 互換設計

実在の伺かゴースト（特に里々製ゴースト）は、文字列処理・条件分岐・計算などを **SAORI（特に `ssu.dll`）** に強く依存しています。SHIORI 本体のみを移植しても SAORI が失敗すると会話や分岐が破綻するため、内蔵シムを必須要件とします。

| 優先度 | 対象 | Android / 非 Windows での対応方針 |
| :--- | :--- | :--- |
| **最優先** | **`ssu`（標準 SAORI ユーティリティ）** | Rust または C++ で互換シムを内蔵し、`satori` からの `ssu.dll` 呼び出しを透過的に横取りして実行する |
| **高** | **`proxy_ex` / 基本文字・配列系 SAORI** | 頻繁に使われる汎用ユーティリティを順次内蔵シムへ追加する |
| **中** | **音声再生系（`mciaudior` 等）** | WebView Audio / OS 音声再生 API への安全なブリッジを検討する |
| **低（安全縮退）** | **Windows 固有 API 依存 SAORI** | 窓操作・OS 監視系はクラッシュさせず、安全なエラー応答（`400` / `204` 相当）＋診断ログ記録で継続動作させる |

---

## 7. OS 差分吸収・ライフサイクル・永続化

1. **大文字・小文字を区別しないパス解決（Case-Insensitive VFS）**: Windows ゴーストの辞書ではファイル名の大文字・小文字の揺れ（例: `dic_Talk.txt` と `dic_talk.txt`）が頻発するため、Android（ext4）上では SHIORI からのファイル探索をケースインセンシティブに解決するラッパ層を通す。
2. **パス区切りと文字コード正規化**: `\` ↔ `/` の正規化に加え、`descript.txt` の `shiori.encoding` / `shiori.forceencoding` および `loadu` / `load` 規約に従い `Shift_JIS (CP932)` ↔ `UTF-8` を変換する。
3. **セーブデータの永続化**: `satori_savedata.txt` や `yaya_variable.cfg` 等の書き出し先を Android のアプリ専用永続領域（`filesDir`）へ確実に同期し、`OnClose`・ゴースト切替・アプリバックグラウンド移行時にフラッシュする。
4. **ライフサイクル連携**: `suspend` / `onTrimMemory` 受信時はキャッシュを解放し、ゴースト終了・切替時は `OnClose` → `unload()` → ネイティブリソース解放（`dlclose`）の順序を保証する。

---

## 8. 段階的実装ロードマップ（Phase 1〜4）

| Phase | 目標 | 主な作業内容 |
| :--- | :--- | :--- |
| **Phase 1** | 判定基盤と統一インターフェース整備 | `descript.txt`＋周辺ファイルによる SHIORI 自動判定、`ShioriEngine` 統一ルーティング、`ssu` シム用の SAORI インターセプト枠の実装 |
| **Phase 2** | 里々（`mock_nanai`）垂直貫通 PoC | `satoriya-shiori` と `ssu` シムを Windows 上で「DLL を使わず内蔵エンジン経由」で動作させ、`OnBoot`・ランダムトーク・メニューを通す。その後 Android NDK（`libsatori.so`）へ展開 |
| **Phase 3** | YAYA / 華和梨展開と Android 実機検証 | `libyaya.so` / `libkawari.so` の統合、ケースインセンシティブ VFS とセーブデータ永続化の実機検証 |
| **Phase 4** | 蒼空・Pasta・湊 / WebView V8 WASM ブリッジ | Tier 2 エンジン（蒼空（Aosora）/ Pasta / 湊）対応および WebView V8 上の `WebAssembly.instantiate` 実行ブリッジを接続し、外部 WASM SHIORI / Web ターゲットへ拡張 |
