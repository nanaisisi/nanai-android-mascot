# NSM 仕様書: バルーン DPI スケーリングおよびクロスプラットフォーム表示仕様

- **策定目的**: Nanai Android Mascot (NSM) における、`descript.txt` の `dpi,推奨DPI` プロパティの独自解釈およびクロスプラットフォーム（Windows / Android）WebView レンダリングにおけるスケーリング仕様の定義。
- **対象コンポーネント**: Rust バックエンド（VFS / Manifest パーサ）、Tauri v2 レンダラ層、フロントエンド UI（`app-actions.js`, `balloon-window.js`）

---

## 1. 概要と背景

伺か（Ukagaka）の標準規格（UKADOC / SSP）では、バルーンが想定する画面の推奨 DPI を指定するプロパティとして `dpi,推奨DPI`（既定値 `96`）が定義されています。SSP では、OS のモニター DPI とバルーンの推奨 DPI を比較し、高 DPI 環境での自動スケーリングを行います。

しかし、**Nanai Android Mascot (NSM)** は、Tauri v2 をベースとしたクロスプラットフォームアプリケーション（Windows デスクトップ版および Android モバイル・タブレット版）であり、描画エンジンに WebView（WebView2 / Android System WebView）を採用しています。
WebView 環境では OS の画面倍率（`window.devicePixelRatio`）に応じて CSS 論理ピクセルが自動スケーリングされるため、従来の Win32 直接制御モデルをそのまま持ち込むと、高密度モバイル画面などで意図しない二重スケーリングやレイアウト破綻が発生します。

そのため、NSM では **WebView の論理ピクセルモデルと `descript.txt` の `dpi` 指定を調停するハイブリッドスケーリング仕様（NSM 独自解釈仕様）**を規定し、採用しています。

---

## 2. NSM 仕様: ハイブリッドスケーリング計算モデル

### 2.1 補正倍率の算出式 (`balloonDpiScale`)

`descript.txt` から取得した `dpi` 値（未指定または不正値の場合は既定値 `96`）に基づき、以下の基準スケール補正係数を算出します。

$$\text{balloonDpiScale} = \frac{96}{\text{Number}(\text{props}[\text{"dpi"}]) || 96}$$

- **`dpi,96`（または未指定）**:
  - `balloonDpiScale = 96 / 96 = 1.0`
  - WebView の標準 `devicePixelRatio` に完全に追従します。既存の一般的な 96 DPI 基準バルーンはそのまま OS 拡大率に合せて拡大表示されます。
- **高 DPI 前提バルーン（例: `dpi,144` = 150%環境）**:
  - `balloonDpiScale = 96 / 144 \approx 0.6667`
  - 制作者が高解像度画像（`balloons0.png` 等）を高 DPI 環境の等倍前提で作成している場合、WebView が `1.5倍` に拡大しようとするのを `0.6667` 倍で相殺し、ターゲット環境でドットバイドットの正確な等倍表示を実現します。

| `descript.txt` の記述 | 基準 DPI | WebView に対する DPI 補正倍率 (`96 / dpi`) | 150% (144 DPI) 環境での実画面表示倍率 |
| :-------------------- | :------- | :----------------------------------------- | :------------------------------------ |
| 未指定 / `dpi,96`     | `96`     | `1.0`（等倍）                              | `1.5` 倍（OS拡大率に追従）            |
| `dpi,120`             | `120`    | `0.8`（80%）                               | `1.2` 倍                              |
| `dpi,144`             | `144`    | `0.6667`（66.7%）                          | `1.0` 倍（ドットバイドット等倍）      |
| `dpi,192`             | `192`    | `0.5`（50%）                               | `0.75` 倍（OS 200% 環境で等倍）       |

### 2.2 ユーザー手動スケーリング（`userScale`）との合成

NSM 独自の拡張機能として、ユーザーはメニュー等からバルーン表示倍率（50% 〜 200%）を手動で変更できます。
最終的な描画スケール（`finalScale`）は、**DPI 推奨補正（`dpiScale`）とユーザー手動スケール（`userScale`）の積**として決定されます。

$$\text{finalScale} = \text{userScale} \times \text{dpiScale}$$

---

## 3. アーキテクチャおよび実装連携

### 3.1 CSS カスタムプロパティ（CSS Variables）

フロントエンドでは、算出された値を以下の CSS 変数としてルート要素（`document.documentElement`）に常時バインドし、スタイル・レイアウト側から参照可能にしています。

- `--balloon-dpi`: パースされた推奨 DPI 数値（例: `96`, `144`）
- `--balloon-dpi-scale`: 算出された補正倍率（例: `1.0`, `0.6667`）

### 3.2 関連モジュール

1. **Rust バックエンド層**:
   - `src-tauri/src/commands/shell.rs`: ゴーストおよびバルーンの `descript.txt` をパースし、`dpi` を含む全プロパティマップ（`BTreeMap<String, String>`）をフロントエンドへ提供。
2. **フロントエンド適用層**:
   - `ui/js/core/app-actions.js`: メインウィンドウにおけるバルーン記述の動的反映（`applyBalloonDescript`, `resetBalloonDescript`, `applyBalloonScaleAction`）。
   - `ui/js/ghost/balloon-window.js`: 独立バルーンウィンドウにおける記述反映およびスケール更新（`applyBalloonDescript`, `updateBalloonWindowScale`）。
