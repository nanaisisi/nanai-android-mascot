# DLLのWASMパッケージングおよびAndroid動的ロード検討書 (DLL to WASM Packaging Research)

## 1. 検討の背景と目的

伺かエコシステム（ゴースト、SHIORI、SAORI、PLUGIN）の多くは、Windows向けネイティブDLL（x86/x64 PEバイナリ）として配布・開発されてきました。
しかし、Android（ARMアーキテクチャ）やWeb環境ではWin32 DLLを直接実行することはできません。

本ドキュメントでは、**「既存DLL（またはそのC/C++ソース）をWebAssembly（WASM）へパッケージング・トランスパイルし、Android等の非Windows環境で動的読み込み・実行可能にするアーキテクチャ」**について実現可能性、技術的アプローチ、課題および対応策を検討します。

---

## 2. 実現のための2大アプローチ

### アプローチA: ソースコード再ビルドによるWASMパッケージング（推奨・確実）

SHIORIエンジン（里々, YAYA, 華和梨, AYA等）の多くはオープンソース（C/C++）で公開されています。

1. **方式**:
   - Emscripten（`emcc`）またはClangの`wasm32-unknown-emscripten` / `wasm32-wasi`ターゲットを用いてビルド。
   - `load`, `request`, `unload` のSHIORI 3.0 C ABI関数をエクスポートする単一の `.wasm` モジュールを生成。
2. **パッケージング形態**:
   - `shiori.wasm` としてゴーストアーカイブ内に同梱、またはアプリケーション側でSHIORI名に対応したWASMパッケージをキャッシュ管理。
3. **メリット**:
   - ネイティブ並みの高い実行速度。
   - メモリ安全なサンドボックス内での実行（Android/Webのセキュリティ制約に完全合致）。
   - Google Play等のアプリストア規約（動的ネイティブコード実行制限）への抵触を回避。

### アプローチB: バイナリDLLのWASMエミュレーション・トランスパイル（ソース非公開DLL向け）

ソースコードが入手困難なレガシーSHIORIやSAORI DLLを対象とする場合のアプローチです。

1. **方式**:
   - **User-mode x86-to-WASMエミュレータ**: `v86` や `box86` / `halium` のようなx86エミュレーションコアをWASM上で動かし、Win32 APIスタブを介してDLLを実行。
   - **静的バイナリトランスパイル**: PE形式バイナリの機械語をLLVM IR経由でWASMへ変換（Wasm2c/LLVMベースの変換基盤）。
2. **課題**:
   - 実行オーバーヘッドおよびファイルサイズ（エミュレータランタイム）の増大。
   - Win32 API（ファイルIO、レジストリ、スレッド等）のスタブ実装が必要。

---

## 3. Androidでの動的ロード・実行フロー

Android上ではWebView（JSランタイム）またはTauri（Rust側 Wasmtime/Wasmer）のいずれかから動的にWASMをロード可能です。

```text
[ゴーストアーカイブ (.nar / .zip)]
         │
         ▼
[shiori.dll 検出] ──(代替 shiori.wasm が存在するか？)
         │                               │
       (No)                             (Yes)
         │                               │
         ▼                               ▼
[互換WASMリポジトリ] ─────────────► [WASM SHIORI ローダー]
 (里々/YAYA等に対応するWASMを取得)                │
                                                 ▼
                                     [WebAssembly.instantiate()]
                                                 │
                                                 ▼
                                     [SHIORI 3.0 API Bridge]
                                       ・load(dirPath)
                                       ・request(rawRequest)
                                       ・unload()
```

---

## 4. 主要な技術検討事項

### 4.1 SHIORI C ABIのWASMマッピング

従来のポインタ・メモリ長渡しインターフェースをWASM線形メモリ（`WebAssembly.Memory`）上で再現します：

- **メモリ管理**:
  文字列（Shift_JIS / UTF-8）をWASM側のヒープメモリに書き込み、ポインタと長さを渡して `request` を呼び出す。
- **戻り値**:
  WASM側から返されたレスポンス文字列のポインタを読み取り、JS/Rust側でパース。

### 4.2 仮想ファイルシステム（VFS）の連携

SHIORIエンジンは辞書ファイル（`.txt`, `.dic`）や設定ファイルを相対パスで読み込みます。

- Emscriptenの **MEMFS** や **IDBFS**（IndexedDBバックエンド）を用いて、ゴースト内の辞書ファイルをWASM内の仮想ファイルシステム上にマウント。
- Androidのストレージから読み込んだバイト列を仮想パスに展開することで、既存のC++コードのファイルオープン処理（`fopen`, `ifstream`）を無修正で動作可能。

### 4.3 文字コード（Shift_JIS ↔ UTF-8）

従来のDLLはShift_JIS前提で組まれているものが多いため、WASM化の際に以下のいずれかで吸収：

1. **境界ラッパー変換**: WASM呼び出しの前後でJS/Rust側の `TextDecoder('shift_jis')` を用いてUTF-8相互変換。
2. **ビルド時Unicode化**: ソースコード側でUTF-8化を適用してWASMビルド。

---

## 5. ロードマップ・実証実験（PoC）計画

1. **Phase 1: 代表的SHIORI（里々・YAYA）のWASMビルド検証**
   - オープンソースリポジトリからEmscriptenによるWASMビルド手順の確立。
   - `OnBoot`, `OnMouseClick` 等の基本リクエストに対するレスポンス確認。
2. **Phase 2: Android WebView上での動的インスタンス化**
   - ゴースト切り替え時に `shiori.wasm` を非同期フェッチして動的に差し替え。
3. **Phase 3: SAORI/PLUGINのWASMサンドボックス拡張**
   - プラグインやSAORIの動的追加への横展開。
