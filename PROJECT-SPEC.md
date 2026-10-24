# Mascot Nanai - プロジェクト仕様書

> **AI 関与について**: このドキュメントは GitHub
> Copilot の支援により作成されました。キャラクター設定・仕様はオーナーユーザーと AI の協議により決定されています。

## プロジェクト概要

**Mascot Nanai**は、伺か（ゴースト）システムを基盤とした透過マスコットアプリケーションです。Tauri + Rust + JavaScript/HTML の構成で、モダンな UI と SHIORI 連携機能を提供します。

## 現在の開発状況

### ✅ 実装済み機能

- 伺か標準準拠のクラシック右クリックメニュー（階層サブメニュー対応）
- シェル倍率制御（50%, 75%, 100%, 125%, 150%, 200%）
- マスコットのドラッグ移動 & タッチスワイプ操作
- プラグイン・拡張機能管理 UI 基盤（JS/WASM対応）
- ゴースト管理・選択機能（mock_nanai公式モック）
- バルーン表示システム（マスコット連動追従）
- モーダルベースの UI（ゴースト、設定、デバッグ、プラグイン等）
- 透過ウィンドウ対応（Windows & モバイル考慮）

### 🚧 進行中の課題

- さくらスクリプト（SakuraScript）タグパーサーの拡張
- SHIORI C++/WASM 動的ロード統合
- 複数キャラクター（kero/1番手）表示対応

### ❌ 未実装機能

- 本格的なバルーン着せ替え管理
- ネットワーク自動更新（OnUpdate）

## 伺か標準メニュー仕様

### メインキャラクター（sakura/0 番）のメニュー

```text
(ゴースト側の設定による項目)
おすすめ(R_)(メニュー)
ポータルサイト(T_)(メニュー)
ネットワーク更新(N_)
────────
<ゴースト側での名称アンインストール>(U_)
────────
RSS/ヘッドライン(H_)(空の項目)(メニュー)
プラグイン(P_)(空の項目)(メニュー)
メールチェック(M_)(空の項目)(メニュー)
シェル倍率(S_)(メニュー)
バルーン倍率(B_)(メニュー)
設定(O_)(メニュー)
────────
ゴースト切り替え(G_)(メニュー)
他のゴーストを呼ふ(Z)(メニュー)
シェル(S)(メニュー)
着せ替え(C_)(メニュー)
バルーン(B_)(メニュー)
最近使ったもの(Y_)(メニュー)
────────
情報(A_)(メニュー)
Language(メニュー)
アイコン化(I_)Ctrl+I
────────
終了(W_)Ctrl+W
全て終了(X_)Ctrl+ Q
```

### 二番キャラクター以降（kero/1 番〜）のメニュー

```text
おすすめ(R_)(メニュー)
着せ替え(C_)(メニュー)
────────
終了(W_)Ctrl+W
全て終了(X_)Ctrl+ Q
```

## 現在の実装との差異

### 現在のメニュー項目（iframe 版）

```text
👻 ゴースト管理
💭 バルーン管理
────────
🔍 スキャン
🧪 テスト
────────
⚙️ 設定
🐛 デバッグ
❓ ヘルプ
```

### 主な差異と対応方針

| 標準メニュー項目   | 現在の実装   | 対応方針                     |
| ------------------ | ------------ | ---------------------------- |
| おすすめ           | なし         | ゴースト側設定により動的実装 |
| ポータルサイト     | なし         | ゴースト側設定により動的実装 |
| ネットワーク更新   | なし         | SHIORI 連携で実装            |
| アンインストール   | なし         | ゴースト管理内に統合予定     |
| シェル倍率         | なし         | 設定モーダル内に実装予定     |
| バルーン倍率       | なし         | 設定モーダル内に実装予定     |
| ゴースト切り替え   | ゴースト管理 | 既存機能を改名               |
| 他のゴーストを呼ふ | なし         | ゴースト管理内に統合予定     |
| シェル             | なし         | 着せ替え機能として実装予定   |
| 着せ替え           | なし         | 新規実装予定                 |
| バルーン           | バルーン管理 | 既存機能を拡張               |
| 情報               | なし         | ヘルプ機能を拡張             |
| アイコン化         | なし         | Tauri 機能で実装予定         |
| 終了/全て終了      | なし         | Tauri 機能で実装予定         |

## ファイル構成

### フロントエンド

- `src/index.html` - メイン UI、iframe メニュー統合
- `src/main.js` - アプリケーションロジック、イベント処理
- `src/styles.css` - UI 全体のスタイル、iframe メニュー対応
- `src/menu-iframe.html` - 独立したメニュー UI

### バックエンド（Tauri/Rust）

- `src-tauri/src/lib.rs` - メインロジック、SHIORI 連携
- `src-tauri/src/main.rs` - Tauri アプリケーション起動
- `src-tauri/tauri.conf.json` - Tauri 設定

### アセット

- `assets/ghost/` - ゴーストファイル配置
- `assets/balloon/` - バルーンファイル配置

## 技術仕様

### アーキテクチャ

- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript
- **バックエンド**: Rust + Tauri
- **UI 方式**: iframe ベースメニュー + モーダルシステム
- **ゴースト連携**: SHIORI 3.0 プロトコル
- **状態管理**: LocalStorage + Rust アプリケーション状態

### 主要クラス・構造

#### JavaScript (`MascotNanaiApp`)

```javascript
class MascotNanaiApp {
  // 初期化・設定
  constructor()
  init()
  initUIEnvironment()

  // ゴースト管理
  autoLoadGhost()
  scanAndLoadFirstGhost()
  selectGhost(ghostName)

  // UI制御
  toggleIframeMenu(menuContainer)
  showModal(contentId)
  hideModal()

  // SHIORI連携
  sendShioriEvent(eventName)
  initializeGhostSHIORI(ghost)
}
```

#### Rust 主要関数

```rust
// ゴースト管理
#[tauri::command]
async fn scan_ghosts(ghost_path: String) -> Result<ScanResult, String>

#[tauri::command]
async fn load_ghost(ghost_name: String) -> Result<String, String>

// SHIORI連携
#[tauri::command]
async fn send_shiori_event(event: String) -> Result<String, String>
```

## 開発進捗と完了状況（ロードマップ）

### 完了した主要基盤仕様 & 実装

1. **【課題1】さくらスクリプト & 文字送り制御（完了）**
   - 仕様書: [docs/sakura-script-and-balloon-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/sakura-script-and-balloon-spec.md)
   - 実装: [src/js/sakura-script.js](file:///e:/project/rust/nanai-android-mascot/src/js/sakura-script.js) によるタイピングアニメーション、`\w`ウェイト、`\s`表情連動、`\q`選択肢生成、タップ早送りスキップ。

2. **【課題2】surfaces.txt アニメーション & 当たり判定（完了）**
   - 仕様書: [docs/surfaces-and-collision-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/surfaces-and-collision-spec.md)
   - 実装: [src/js/surface.js](file:///e:/project/rust/nanai-android-mascot/src/js/surface.js) による `surfaces.txt` 座標パース、表示倍率逆算座標判定、部位（head, bust, skirt等）ごとのタッチイベント分岐。

3. **【課題3】文字コード変換 (Shift_JIS ↔ UTF-8) & 仮想FS（完了）**
   - 仕様書: [docs/encoding-and-vfs-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/encoding-and-vfs-spec.md)
   - 実装: [src/lib.rs](file:///e:/project/rust/nanai-android-mascot/src/lib.rs) の `open_text_file`（UTF-8/Shift_JIS自動判定）および `resolve_vfs_path`（大文字・小文字無視解決）、Tauri アセットプロトコル統合。

4. **【課題4】Android システムオーバーレイ & 常駐生存（完了）**
   - 仕様書: [docs/android-overlay-and-service-spec.md](file:///e:/project/rust/nanai-android-mascot/docs/android-overlay-and-service-spec.md)
   - 実装: [src/css/base.css](file:///e:/project/rust/nanai-android-mascot/src/css/base.css) の透過領域タッチスルー（`pointer-events: none` 制御）、[src/js/interaction.js](file:///e:/project/rust/nanai-android-mascot/src/js/interaction.js) & [src/css/mascot.css](file:///e:/project/rust/nanai-android-mascot/src/css/mascot.css) の画面端スナップ（ドッキング退避 & タップ復帰）。

## 今後の拡張検討事項

1. **ネットワーク機能**
   - RSS/ヘッドライン
   - ネットワーク更新 (OnUpdate)

2. **プラグインシステム & WASM SHIORI**
   - プラグイン管理モーダルでの外部スクリプト動的組み込み
   - WASM 版 SHIORI (Satori/YAYA 等) の Web Worker サンドボックス実行

## デバッグ・確認方法

### コマンドライン確認

```bash
# Nushell環境での起動
$env.RUST_LOG = "debug"; cargo tauri dev

# 標準的な環境変数設定
RUST_LOG=debug cargo tauri dev
```

### ログ確認ポイント

- JavaScript: ブラウザコンソール
- Rust: ターミナル出力
- Tauri: デバッグモーダル内ログ出力

### 主要な検証項目

1. iframe メニューの表示・非表示切り替え
2. 親子ウィンドウ間のメッセージ通信
3. モーダルの開閉動作
4. ゴーストスキャン・選択機能
5. SHIORI 連携の基本動作

## 既知の問題と対処法

### 問題 1: Tauri アプリが即座に終了

- **原因**: Rust 側の panic、設定ミス、依存関係の問題
- **対処**: デバッグログの確認、設定ファイルの見直し

### 問題 2: iframe メニューの応答なし

- **原因**: 同一オリジンポリシー、iframe 通信の失敗
- **対処**: コンソールログでの通信確認、イベントリスナーの検証

### 問題 3: ゴーストが見つからない

- **原因**: パス設定、ファイル構造の問題
- **対処**: assets/ghost ディレクトリの確認、パス解決デバッグ

---

_更新日: 2025 年 7 月 5 日_
_バージョン: v1.0.0-alpha_
