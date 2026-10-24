# WASM化指針 & JavaScript拡張システム仕様書

## 1. 概要と背景

従来の伺か（ベースウェア）システムは、Windows 固有の **ネイティブ DLL（`shiori.dll`, `plugin.dll`）** に強く依存していました。
しかし、本プロジェクト「**nanai-android-mascot**」が目指すマルチプラットフォーム（Android / Windows / Web版）への展開において、ネイティブ DLL 方式には以下の重大な課題があります：

1. **プラットフォーム移植性の壁**:
   - Android（ARM/NDK）、Linux、iOS、Web ブラウザにおいて、Win32 DLL はそのまま動作しない。
2. **セキュリティと配布の制約**:
   - モバイル OS やアプリストアでは、未署名のネイティブコード動的ロードは制限される。
3. **拡張開発の敷居の高さ**:
   - C/C++ や Rust による拡張機能開発は、多くのゴースト作者・Web 技術者にとって学習コストが高い。

本指針では、**「堅牢なコア機能の WASM（WebAssembly）化」** と **「JavaScript/TypeScript による高い可変性・拡張性の維持」** を両立させるハイブリッド・アーキテクチャを定義します。

---

## 2. 全体アーキテクチャ（3層分離設計）

```text
┌─────────────────────────────────────────────────────────────┐
│                      Layer 3: 拡張機能層                     │
│   ・JS/TS プラグイン (Webhook / イベントリスナー)             │
│   ・ユーザー定義スクリプト (対話モジュール / AI 連携)        │
│   ・カスタムバルーン / テーマ CSS                           │
├─────────────────────────────────────────────────────────────┤
│                 Layer 2: アプリケーション制御層              │
│   ・UI / インタラクション (ドラッグ・タッチ・メニュー)       │
│   ・プラグインマネージャー & イベントバス                    │
│   ・SakuraScript インタプリタ                               │
├─────────────────────────────────────────────────────────────┤
│                   Layer 1: コア & WASM 実行層                │
│   ・WASM SHIORI エンジン (里々 / YAYA / 独自ゴーストコア)   │
│   ・サーフィス合成・PNA/透過画像デコーダー (WASM)            │
│   ・Tauri Native Bridge (Android オーバーレイ / システム通知)│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. WASM化指針（コアエンジンの移植方針）

### 3.1 WASM化対象のコンポーネント

| コンポーネント | 従来実装 | WASM化の狙い |
| :--- | :--- | :--- |
| **SHIORI エンジン (里々/YAYA)** | C++ DLL | Emscripten / Clang WASM ターゲットでコンパイル。OS を問わず同一バイナリで対話ロジックを高速・安全に実行。 |
| **独自ゴースト・スクリプトエンジン** | Rust (`libloading`) | `wasm-bindgen` を用いてビルド。Web ブラウザ版および Android WebView 上でサンドボックス動作。 |
| **画像処理 / PNA・透過合成** | GDI+ / 独自 C++ | Canvas 2D よりも高速かつメモリ効率の高いピクセル透過・マスク合成を WASM (Rust/C++) で処理。 |

### 3.2 SHIORI 3.0 on WASM のインターフェース仕様

従来の C 言語スタイルの `load(hInst, len)` / `request(hText, &len)` / `unload()` を、WASM 向けに標準化：

```typescript
// WASM SHIORI インターフェース定義
export interface WasmShioriEngine {
  /** SHIORI 初期化 (ゴースト辞書パスまたはアーカイブを展開) */
  load(ghostFiles: Map<string, Uint8Array>): Promise<boolean>;

  /** SHIORI 3.0 リクエスト文字列の送受信 */
  request(requestText: string): Promise<string>;

  /** アンロード処理 */
  unload(): Promise<boolean>;
}
```

- **メリット**:
  - 辞書ファイル（`.txt`）をメモリ上の Virtual FS（仮想ファイルシステム）に展開可能。
  - 端末ローカルのファイルシステム差異（Android の Scoped Storage 等）に影響されない。

---

## 4. JavaScript 拡張機能（Plugin System）による可変性・拡張性の維持

WASM でコアを強固にしつつ、ユーザーが手軽に機能を拡張・カスタマイズできるよう、**モダンな JavaScript/TypeScript 拡張システム** を導入します。

### 4.1 プラグイン（拡張機能）の構造

プラグインはフォルダ単位で配布され、以下の構成を取ります：

```text
plugins/
└── sample-weather-plugin/
    ├── plugin.json       # メタデータ・権限宣言
    ├── index.js          # エントリーポイント (ES Module)
    └── style.css         # 追加 UI スタイル (任意)
```

#### `plugin.json`（マニフェスト定義）

```json
{
  "id": "nanai-weather-plugin",
  "name": "お天気通知プラグイン",
  "version": "1.0.0",
  "author": "Nanai Project",
  "permissions": [
    "network:fetch",
    "shiori:raise_event",
    "ui:balloon"
  ]
}
```

### 4.2 プラグイン API（Plugin SDK）仕様

拡張機能はグローバルな汚染を防ぎ、安全な `PluginContext` 経由でのみアプリにアクセスします。

```javascript
// index.js の実装例
export default class WeatherPlugin {
  async onInit(context) {
    this.context = context;
    console.log("お天気プラグインがロードされました");

    // 1. 定期イベントのフック
    context.events.on("OnMinuteChange", async () => {
      await this.checkWeather();
    });

    // 2. メニュー項目の追加
    context.menu.registerItem({
      id: "check-weather",
      label: "☀️ 天気予報を聞く",
      action: () => this.speakWeather(),
    });
  }

  async checkWeather() {
    // 天気 API 取得
    const res = await this.context.network.fetch("https://api.weather...");
    const data = await res.json();
    
    // ゴーストにイベントとして渡す、または直接バルーン表示
    this.context.shiori.raiseEvent("OnWeatherNotice", [data.weather, data.temp]);
  }

  speakWeather() {
    this.context.ui.showBalloon("今日はいい天気だよ！お出かけ日和だね♪");
  }

  onDestroy() {
    console.log("お天気プラグインが破棄されました");
  }
}
```

### 4.3 提供される拡張ポイント（Hooks & Extensibility）

1. **イベントフック (`context.events`)**:
   - `OnBoot`, `OnSecondChange`, `OnMouseClick`, `OnBalloonClick` 等の標準イベントへの割り込み・追加処理。
2. **UI 拡張 (`context.ui` / `context.menu`)**:
   - モバイル向けリングメニューや PC コンテキストメニューへの独自アクション追加。
   - バルーン内への独自 HTML/CSS 要素（ボタン、グラフ、アニメーション）の埋め込み。
3. **対話拡張 (`context.shiori`)**:
   - 独自の擬似 SHIORI 応答の注入（LLM / 生成 AI API との連携プラグイン等）。

---

## 5. ロードマップと実装ステップ

### フェーズ 1: JS 拡張基盤（Plugin Manager）のプロトタイプ

- [ ] ES モジュール動的インポート（`import()`）によるプラグイン読み込み基盤の作成。
- [ ] イベントバス（`EventEmitter`）の実装と、コアイベントのフック機能。

### フェーズ 2: WASM SHIORI / Virtual FS プロトタイプ

- [ ] Emscripten による C++ SHIORI（Satori / YAYA）の WASM ビルド検証。
- [ ] メモリ上仮想ファイルシステム（MemFS）による辞書ロード・パース検証。

### フェーズ 3: プラグイン SDK & サンプル公開

- [ ] サンプル拡張機能（天気予報、RSSリーダー、AIトーク連携）の作成。
- [ ] プラグインの有効化・無効化を行える UI モーダルの実装。
