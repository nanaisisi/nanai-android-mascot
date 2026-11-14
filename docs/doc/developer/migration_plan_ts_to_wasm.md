# TSからWASMへの移行計画・ファイル整理方針

TypeScriptからWASM (Rust) への移行に伴う、すべてのTypeScriptファイルおよび関連テストファイルの整理方針と移行手順です。

---

## 移行の基本方針

1. **WASMへ完全移管してTSから消すもの（【消す / WASM化】）**
   - パース処理（さくらスクリプト、`surfaces.txt`, `descript.txt`）
   - アニメーション計算、タイムライン、タイマー、フレーム決定ロジック
   - ピクセル演算、ブレンディング、クロマキー合成、レイヤー合成（`compositor`）
   - ゴースト・SHIORIの状態管理・プロトコル処理・キュー管理

2. **DOM / Web View層としてTSに残すもの（【残す / ブリッジ化】）**
   - HTML DOM操作、Context Menu/モーダルダイアログ/HTMLテンプレートの描画
   - タッチ・マウスイベントの一次受取とWASMへの転送
   - Canvasへの描画指示 (`putImageData` 等) や Android Native Bridge との接続
   - アプリのエントリーポイント (`main.ts`, `vite.config.ts` 等)

3. **テストファイルの扱い（【順次削除 / WASMテストに置換】）**
   - TS側の内部ユニットテストは、Rust側 (`cargo test`) に実装が移るため **順次削除**。
   - WASM化後は、WASMとTSの境界を検証する統合テスト（`wasm-bridge.test.ts`等）のみTS側に残す。

---

## ファイル対応リスト

### 1. コア & WASMブリッジ層 (`ui/ts/core/`, `ui/`)

| ファイル名                               | 方針                | 理由・説明                                                                                       |
| :--------------------------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| `ui/main.ts`                             | **【残す】**        | アプリエントリーポイント（WASMの初期化・起動を担う）                                             |
| `ui/bindings.ts`                         | **【残す/変更】**   | WASM関数の呼び出し用バインディング定義                                                           |
| `ui/global.d.ts`                         | **【残す/変更】**   | 型定義ファイル                                                                                   |
| `ui/ts/core/wasm-bridge.ts`              | **【残す/拡張】**   | TS - WASM間のインターフェース層                                                                  |
| `ui/ts/core/wasm/wasm-layout.ts`         | **【消す】**        | WASM側のRustロジックに吸収                                                                       |
| `ui/ts/core/wasm/wasm-memory.ts`         | **【消す】**        | WASMメモリ管理はRust/wasm-bindgenに統一                                                          |
| `ui/ts/core/wasm/wasm-protocol.ts`       | **【消す】**        | プロトコルハンドラはRust化                                                                       |
| `ui/ts/core/wasm/wasm-sakura.ts`         | **【消す】**        | Rust側のさくらスクリプト処理へ移管                                                               |
| `ui/ts/core/wasm/wasm-surface.ts`        | **【消す】**        | Rust側のサーフェス処理へ移管                                                                     |
| `ui/ts/core/wasm/wasm-types.ts`          | **【残す/変更】**   | TS側で使用する最小限の型定義へ簡素化                                                             |
| `ui/ts/core/app-actions.ts`              | **【残す/軽量化】** | DOM/UI操作アクション呼び出し部                                                                   |
| `ui/ts/core/app-events.ts`               | **【残す/軽量化】** | DOMイベント管理                                                                                  |
| `ui/ts/core/app-settings.ts`             | **【残す】**        | アプリ設定（LocalStorage/IndexedDB保存等）                                                       |
| `ui/ts/core/app-update.ts`               | **【残す】**        | アップデートダイアログ・通信処理                                                                 |
| `ui/ts/core/config.ts`                   | **【残す】**        | 定数設定                                                                                         |
| `ui/ts/core/internal-window-manager.ts`  | **【残す】**        | DOMウィンドウ位置・レイアウト管理                                                                |
| `ui/ts/core/tauri-helper.ts`             | **【残す】**        | Native/Tauri APIのラッパー                                                                       |
| `ui/ts/core/actions/balloon-*`           | **【一部消す】**    | 計算・レイアウト推論（`layout/`, `font/`）はWASM化。DOMスタイル適用 (`theme-dom.ts`) は **残す** |
| `ui/ts/core/actions/dictation.ts`        | **【残す】**        | Web Speech API (DOM) 依存                                                                        |
| `ui/ts/core/actions/install-protocol.ts` | **【消す】**        | ファイル展開・インストール計算はRustへ                                                           |
| `ui/ts/core/actions/sstp-fmo-actions.ts` | **【消す】**        | FMO/SSTP処理ロジックはRustへ                                                                     |

### 2. さくらスクリプト & SHIORI / ゴースト制御層 (`ui/ts/ghost/`)

| ファイル名 / ディレクトリ                             | 方針              | 理由・説明                                                      |
| :---------------------------------------------------- | :---------------- | :-------------------------------------------------------------- |
| `ui/ts/ghost/sakura-script.ts`                        | **【消す】**      | さくらスクリプト処理は全件 Rust (`nanai-core`) に移管           |
| `ui/ts/ghost/sakura-parser.ts`                        | **【消す】**      | Rustのパース処理に移管                                          |
| `ui/ts/ghost/sakura-tokenizer.ts`                     | **【消す】**      | Rustに移管                                                      |
| `ui/ts/ghost/sakura-play.ts`                          | **【消す】**      | 再生エンジンはRust側で状態管理                                  |
| `ui/ts/ghost/sakura-play/*` (全サブモジュール)        | **【消す】**      | キュー管理、タイミング、ハンドラ計算はRustへ                    |
| `ui/ts/ghost/parser/*` (全サブモジュール)             | **【消す】**      | AST生成・タグ解析ロジックは完全Rust化                           |
| `ui/ts/ghost/command-handler/*` (全コマンド)          | **【消す】**      | さくらスクリプトのコマンド実行判断はRustへ                      |
| `ui/ts/ghost/ghost.ts` / `ghost-shiori.ts`            | **【消す】**      | ゴーストデータ構造・SHIORIブリッジはRustへ                      |
| `ui/ts/ghost/shiori-protocol.ts` / `shiori-worker.ts` | **【消す】**      | Worker内のSHIORIパース・読み込み処理はWASM化                    |
| `ui/ts/ghost/wasm-shiori-loader.ts`                   | **【残す/変更】** | WASM化されたSHIORIモジュールをWeb環境でloadする最小限のブリッジ |
| `ui/ts/ghost/shiori-notify/*`                         | **【消す】**      | SHIORI通知イベント構築ロジックはRustへ                          |

### 3. サーフェス描画 & アニメーション層 (`ui/ts/surface/`)

| ファイル名 / ディレクトリ                                                     | 方針              | 理由・説明                                                                  |
| :---------------------------------------------------------------------------- | :---------------- | :-------------------------------------------------------------------------- |
| `ui/ts/surface/surface.ts` / `surface-manager.ts`                             | **【消す】**      | サーフェス管理・描画状態の維持はRust側で行う                                |
| `ui/ts/surface/surface-parser.ts` / `parser/*`                                | **【消す】**      | `surfaces.txt` やアニメーション定義のパースはRustへ                         |
| `ui/ts/surface/surface-render.ts`                                             | **【残す/変更】** | WASMから受け取ったピクセルバッファをCanvasへ転送する処理のみ残す            |
| `ui/ts/surface/surface-compositor.ts`                                         | **【消す】**      | 合成計算ロジックはRustへ                                                    |
| `ui/ts/surface/compositor/*` (`framebuffer`, `layer`, `blend-*`, `chromakey`) | **【消す】**      | 画像合成・ピクセル演算はRustへ移行（Rustが得意な高速処理分野）              |
| `ui/ts/surface/animation-parser.ts`                                           | **【消す】**      | アニメーション構文解析はRustへ                                              |
| `ui/ts/surface/animation/*`                                                   | **【消す】**      | タイムライン計算、フレームスケジュール、タイマー管理はRustへ                |
| `ui/ts/surface/surface-collision.ts`                                          | **【消す】**      | 当たり判定計算はRustへ                                                      |
| `ui/ts/surface/surface-dressup.ts`                                            | **【消す】**      | 着せ替えデータ処理・計算はRustへ                                            |
| `ui/ts/surface/shell-manifest.ts`                                             | **【消す】**      | シェルマニフェスト解析はRustへ                                              |
| `ui/ts/surface/interaction/*`                                                 | **【残す/変更】** | ドラッグ・ホバーのDOMイベント取得はTSに残し、座標計算・状態判定はWASMへ委譲 |

### 4. DOM / UI レンダラー & タッチ層 (`ui/ts/ui/`, `ui/windows/`)

| ファイル名 / ディレクトリ                           | 方針              | 理由・説明                                                                      |
| :-------------------------------------------------- | :---------------- | :------------------------------------------------------------------------------ |
| `ui/ts/ui/app-menu.ts` / `context-menu.ts`          | **【残す】**      | HTML/CSSによるコンテキストメニューの描画とDOMイベント                           |
| `ui/ts/ui/modal.ts` / `modal-explorer.ts`           | **【残す】**      | ダイアログのDOM表示・レイアウト                                                 |
| `ui/ts/ui/loading-banner.ts`                        | **【残す】**      | ローディング表示 (DOM)                                                          |
| `ui/ts/ui/menu-dispatcher.ts` / `submenu.ts`        | **【残す】**      | メニュー操作ハンドリング                                                        |
| `ui/ts/ui/renderers/*` (全DOMレンダラー)            | **【残す】**      | HTMLフォーム、ダイアログ入力、テーマ描画などのDOM生成処理                       |
| `ui/ts/ui/templates/*` (全テンプレート)             | **【残us】**      | HTMLテンプレート定義                                                            |
| `ui/ts/ui/touch/*` (全タッチモジュール)             | **【残す/調整】** | スマホ・タブレット用ジェスチャー検知（DOMイベント受取り）。判定結果はWASMへ送る |
| `ui/ts/ui/touch/android-bridge.ts`                  | **【残す】**      | Android Native Bridge通信                                                       |
| `ui/windows/*` (`desktop-features`, `multi-window`) | **【残す】**      | マルチウィンドウ・デスクトップ固有UI制御                                        |

### 5. スクリプト・設定ファイル (`scripts/`, 設定ファイル)

| ファイル名               | 方針              | 理由・説明                                   |
| :----------------------- | :---------------- | :------------------------------------------- |
| `vite.config.ts`         | **【残す/更新】** | WASMビルド・プラグイン対応の追加             |
| `vitest.config.ts`       | **【残す/更新】** | テスト構成の調整                             |
| `scripts/verification/*` | **【残す/修正】** | ビルド・ライセンス・スペック検証用スクリプト |

### 6. テストファイル群 (`tests/`)

| テストファイル・カテゴリ                                                                                                                                           | 方針              | 移行手順・理由                                                                                      |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :-------------------------------------------------------------------------------------------------- |
| **ロジック系TSテスト**<br>(`sakura-*.test.ts`, `surface-*.test.ts`, `parser-fuzzing/*.test.ts`, `canvas-pixel-snapshot/*.test.ts`, `command-handler-*.test.ts` 等) | **【順次削除】**  | TSロジックの削除に伴い、同等のテストは Rust (`cargo test`) 側に実装。TS側のテストコードは削除対象。 |
| **DOM / UI / Androidブリッジ系テスト**<br>(`android-bridge/*.test.ts`, `modal-dialog/*.test.ts`, `context-menu.test.ts`, `touch/*.test.ts`)                        | **【一部残す】**  | DOMの挙動やAndroid Bridgeのやり取りをテストするTSテストは継続して利用。                             |
| **WASM統合テスト**<br>(`wasm-bridge.test.ts`, `nanai-core-wasm.test.ts` 等)                                                                                        | **【残す/拡充】** | WASMとTSの境界動作を検証するテストとして維持・拡張。                                                |

---

## 推奨移行手順（テスト削除アプローチ）

```
[Step 1: Rust実装 & cargo test]
   └── 対象機能 (例: sakura-parser, compositor) を Rust 側に実装し、cargo test で単体テストをパスさせる。

[Step 2: 対応する TS テストの削除]
   └── Rustに移管完了した機能に対応する TS テスト (tests/sakura-*.test.ts など) を削除する。
       （これによりリファクタリング中の無用なTSテストエラーを防ぐ）

[Step 3: TS実装の削除 & WASM Bridge呼び出しへの置換]
   └── 不要になった TS 実装ファイルを削除し、WASM Bridge を呼び出す処理に置き換える。

[Step 4: WASM統合テストの実施]
   └── wasm-bridge.test.ts 等の統合テストで、TS-WASM境界の連携を検証・テストする。
```
