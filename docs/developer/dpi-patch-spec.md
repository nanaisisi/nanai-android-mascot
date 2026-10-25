- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

> **AI 関与について**: このドキュメントは AI アシスタントの支援により作成されました。
> 関連コミット: `0c34f2d` (ローカルパッチ導入), `96f769a` (Rust 2024 / 最新依存対応)

# dpi クレート改変仕様・記録書 (patches/dpi)

## 1. 核心的背景：なぜパッチが必要だったのか（本題）

Windows 環境において、Tauri v2 (`tao` / `wry`) がウィンドウサイズやマウスクリック座標を物理ピクセル・論理ピクセル間で変換する際、アップストリーム（crates.io 版 `dpi 0.1.2`）では以下の**致命的なパニック（クラッシュ）**が発生していました：

```text
thread 'main' panicked at ...\dpi-0.1.2\src\lib.rs:636:9:
assertion failed: validate_scale_factor(scale_factor)
```

### 1.1 パニックの根本原因

アップストリームの `dpi` では、スケールファクター変換を行うすべての関数（`to_logical`, `to_physical` 等）の冒頭で以下の厳格なアサーションが実行されていました：

```rust
// 原本 (crates.io dpi 0.1.2) の実装
#[inline]
pub fn validate_scale_factor(scale_factor: f64) -> bool {
    scale_factor.is_sign_positive() && scale_factor.is_normal() && scale_factor > 0.0
}

// 例: to_logical 等の内部
assert!(validate_scale_factor(scale_factor));
```

しかし、特定の条件下で `scale_factor` に一時的に `0.0`、非正規化数（サブノーマル）、`NaN`、あるいは極小値が渡ると、このアサーションに引っかかりアプリ全体が即死・クラッシュしていました。

---

## 2. なぜ「他の環境・一般的なアプリ」では起きず、ここで直撃したのか？

「なぜ他の Tauri アプリや、macOS / Android / Linux ではこの問題が顕在化していないのか？」という疑問に対する技術的な要因は以下の通りです。

### 2.1 デスクトップマスコット特有の「枠なし＋透過ウィンドウ」構成

[tauri.conf.json](../../src-tauri/tauri.conf.json) にある通り、本プロジェクトは伺かマスコットとして以下の特殊なウィンドウ属性を持っています：

```json
"transparent": true,
"decorations": false,
"alwaysOnTop": true
```

- **Win32 API (DWM) の挙動差異**:
  - **一般的なアプリ**: タイトルバーやウィンドウ枠（非クライアント領域）を持つ通常のウィンドウは、OS がウィンドウハンドル（`HWND`）を生成した直後に所属モニターの DPI（`GetDpiForWindow` / `MonitorFromWindow`）を即座に確定できます。
  - **枠なし透過アプリ**: `decorations: false` かつ `transparent: true`（DWM アクリル・アルファ合成）の場合、ウィンドウバッファが割り当てられる前や、DWM との合成バインドが完了するごく初期のミリ秒未満の隙間で、モニター判定が一時的に `NULL`（または `0`）を返すタイミングが存在します。
  - この一瞬の未確定ステートで `tao` を経由して `scale_factor = 0.0` が渡り、`assert!` に直撃していました。

### 2.2 OS アーキテクチャの根本的な違い

- **macOS (Cocoa / AppKit)**:
  - ポイント（Points）とピクセルのスケーリングが OS レベルで完全に抽象化されており、ウィンドウ生成時から `backingScaleFactor` が常に最低でも `1.0` または `2.0` を返します。`0.0` になる構造が存在しません。
- **Android**:
  - Android には「マルチモニター間を跨ぐ自由ドラッグ」や「Win32 式の DWM 透過フレーム」の概念がなく、`DisplayMetrics.density`（例: 2.75, 3.0 等）は Activity 生成時から常に固定の正の値として確定しています。
- **Linux (Wayland / X11)**:
  - スケールファクターの通知はプロトコルイベントベースであり、未初期化の `0.0` が送出されるケースが極めて稀です。

### 2.3 初期化レースコンディション

本アプリは起動時にトレイアイコン生成、透過 WebView のロード、複数モジュールの初期化を非同期かつ高速に実行しています。Win32 のメッセージループ（`WM_CREATE`, `WM_NCCREATE`, `WM_DPICHANGED`）が完全に整う前に、透過 WebView の初期レイアウト計算が走って座標変換を呼び出すことで、未確定の `0.0` を拾ってしまうレースコンディションが発生していました。

---

## 3. 現状のローカルパッチでの対症療法 (`patches/dpi`)

クラッシュを回避するため、[`patches/dpi/src/lib.rs`](../../patches/dpi/src/lib.rs) では以下のサニタイズ処理が施されています：

```rust
// 1. validate_scale_factor を常に true にして assert でのプロセス即死を防止
#[inline]
pub fn validate_scale_factor(_scale_factor: f64) -> bool {
    true
}

// 2. 異常な scale_factor が渡った場合は安全なフォールバック値 (1.0) に補正
#[inline]
fn sanitize_scale_factor(scale_factor: f64) -> f64 {
    if scale_factor.is_sign_positive() && scale_factor.is_normal() && scale_factor > 0.0 {
        scale_factor
    } else {
        1.0
    }
}
```

---

## 4. 「手元にパッチを持たない」ための脱却戦略（外部化と本家還元）

リポジトリ内にパッチ（`patches/dpi`）を抱え込むことは、**外部クレートのコード保守義務や多重ライセンス（MIT/libm/Apache-2.0）の著作権告知負担** を本プロジェクトに引き込むことになります。
また、コードを勝手に削ってライセンス解釈で押し通すことは法的・コンプライアンスリスクを伴うため、**公式コードを尊重した上で手元から完全に切り離す（外部化）** 方針を採用します。

### 戦略 A: Git リポジトリ（フォーク）への外部化 【採用方針】

1. GitHub 上で公式本家（`rust-windowing/winit`）から正式にフォークしたリポジトリ [nanaisisi/winit](https://github.com/nanaisisi/winit) を用意する。
2. 修正ブランチ（`fix-windows-scale-factor`）を作成・プッシュする。
3. 本プロジェクトの [Cargo.toml](../../Cargo.toml) からは以下のように正規フォークを指定する：

   ```toml
   [patch.crates-io]
   dpi = { git = "https://github.com/nanaisisi/winit.git", branch = "fix-windows-scale-factor" }
   ```

4. 本プロジェクト内の `patches/` ディレクトリは**完全に物理削除**する。

- **効果**:
  - 本リポジトリ内には他者著作物・パッチファイルが一切残らず、完全にクリーンな状態となる。
  - ライセンス告知義務は通常の外部オープンソース依存（crates.io や git 依存と同様）と同じ標準的なワークフローに統一される。

### 戦略 B: アップストリーム（winit / dpi）への還元

- 「`validate_scale_factor` で即座にプロセスをパニック死させるのではなく、Windows の初期化レースコンディション等による `0.0` を安全にハンドリング（フォールバック）すべき」という修正を本家にプルリクエストとして還元する。
- 公式クレート（crates.io）が更新された暁には、`[patch.crates-io]` 指定そのものを完全削除して公式版へ復帰する。
