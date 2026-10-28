# dpi,推奨DPI

- **規格**: [dpi.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/dpi.md)
- **検索語**: dpi
- **対応状況**: ✅ 対応済（独自ハイブリッドスケーリング実装）
- **カテゴリ**: `descript.txt`（Balloon）
- **書式**: `dpi,推奨DPI`
- **既定値**: `96`（Windows標準 100% スケーリング相当）
- **SSP対応バージョン**: SSP 2.7.21 以降 / `nanai-android-mascot`（Tauri v2 / クロスプラットフォーム WebView）独自の解釈実装
- **検索語**: `dpi`, `balloonDpiScale`, `balloon-scale`, `--balloon-dpi`, `--balloon-dpi-scale`

## 突合結果

Tauri / Web レンダラ層（WebView2 / Android System WebView）および Rust バックエンド層において、UKADOC/SSP の `dpi` 指定値をクロスプラットフォーム環境（Windowsデスクトップ / Androidモバイル・タブレット）に適合させた**「半分独自仕様（ハイブリッドスケーリングモデル）」**として完全実装されている。

---

## 1. UKADOC 仕様概要（標準仕様）

バルーン制作環境で想定している画面の推奨 DPI 値を指定するプロパティ。未指定時は Windows 標準の `96` 固定として扱われる。

| Windows ディスプレイ拡大縮小率 | 推奨 DPI 指定値 | 主な環境目安                      |
| :----------------------------- | :-------------- | :-------------------------------- |
| 100%                           | `96`（既定値）  | フルHD（1920×1080）デスクトップ等 |
| 125%                           | `120`           | モバイルノートPC                  |
| 150%                           | `144`           | 4Kモニタ・高解像度ノートPC        |
| 175%                           | `168`           | 高精細タブレット・大型4K環境      |
| 200%                           | `192`           | Retina / 超高精細ディスプレイ     |

SSP（2.7.21以降）では、現在の OS ディスプレイ DPI（例: 144 = 150%）とバルーン側の推奨 `dpi` 指定値（例: 96 または 144）を比較し、高 DPI 環境でのバルーン自動スケーリング倍率（`OS_DPI / Balloon_DPI`）を決定する。

---

## 2. `nanai-android-mascot` における「半分独自仕様」の背景と設計

### 2.1 なぜ「半分独自仕様」になるのか（プラットフォームの差異）

- **SSP（Win32環境）**: OS の Win32 API（Per-Monitor DPI Aware）からモニターごとの物理/論理 DPI を直接取得し、Win32 ウィンドウサイズやGDI描画を直接スケーリングする。
- **`nanai-android-mascot`（Tauri v2 / WebView環境）**:
  - 本アプリは Tauri v2（Windows は WebView2、Android は Android System WebView）上で動作する。
  - レンダリングエンジン自体が OS のディスプレイ倍率（`window.devicePixelRatio`）に応じて CSS ピクセルを自動スケーリングする。
  - そのため、SSP のような Win32 モニター DPI 直接比較モデルをそのまま適用すると、高密度なモバイル画面（Android の `devicePixelRatio = 2.0〜3.0` 等）やデスクトップの高 DPI 環境で二重スケーリングやレイアウト破綻が発生する。

### 2.2 ハイブリッドスケーリングの換算ロジック（実装仕様）

WebView の自動ピクセル比率調整と `descript.txt` の `dpi` 推奨値を調停するため、本アプリでは以下の換算式による**独自の中間スケール（`balloonDpiScale`）**を導入している。

$$\text{balloonDpiScale} = \frac{96}{\text{Number}(\text{props}[\text{"dpi"}]) || 96}$$

- **既定動作（`dpi,96` または未指定）**:
  - `balloonDpiScale = 96 / 96 = 1.0`
  - OS および WebView の標準スケーリング（`devicePixelRatio`）に完全に追従する。既存の一般的なバルーンはすべてこの動作になる。
- **高 DPI 前提バルーン（例: `dpi,144`）**:
  - `balloonDpiScale = 96 / 144 \approx 0.6667`
  - 制作者が高 DPI 環境（150% = 144 DPI）で等倍表示されるよう高解像度画像（`balloons0.png` 等）を作成している場合、WebView が `1.5倍` に拡大しようとするのを `0.6667` 倍で相殺し、ターゲット環境でドットバイドットの等倍表示を実現する。

| `descript.txt` の記述 | 基準 DPI | WebView に対する DPI 補正倍率 (`96 / dpi`) | OS 150% (144 DPI) 環境での実画面表示倍率 |
| :-------------------- | :------- | :----------------------------------------- | :--------------------------------------- |
| 未指定 / `dpi,96`     | `96`     | `1.0`（等倍）                              | `1.5` 倍（OS拡大率に追従）               |
| `dpi,120`             | `120`    | `0.8`（80%）                               | `1.2` 倍                                 |
| `dpi,144`             | `144`    | `0.6667`（66.7%）                          | `1.0` 倍（ドットバイドット等倍）         |
| `dpi,192`             | `192`    | `0.5`（50%）                               | `0.75` 倍（OS 200% 環境で等倍）          |

### 2.3 ユーザー手動スケーリング（`userScale`）との動的合成

UKADOC / SSP 規格には存在しない `nanai-android-mascot` 独自の機能として、ユーザーがメニューからバルーン表示倍率（50% 〜 200%）を手動変更できる。
最終的な描画スケール（`finalScale`）は、**DPI 推奨補正（`dpiScale`）とユーザー手動スケール（`userScale`）の積**として計算され、CSS 変数および `transform: scale(...)` に適用される。

$$\text{finalScale} = \text{userScale} \times \text{dpiScale}$$

---

## 3. 関連実装ファイルと連携フロー

- **Rust バックエンド層**:
  - [src-tauri/src/commands/shell.rs](../../../../src-tauri/src/commands/shell.rs) の `balloon_manifest` コマンドにて、`descript.txt` の全エントリ（`dpi` を含む）をパースし `BTreeMap<String, String>` としてフロントエンドへ返却。
- **フロントエンド適用層**:
  - [ui/js/core/app-actions.js](../../../../ui/js/core/app-actions.js) (`applyBalloonDescript`, `resetBalloonDescript`, `applyBalloonScaleAction`)
  - [ui/js/ghost/balloon-window.js](../../../../ui/js/ghost/balloon-window.js) (`applyBalloonDescript`, `updateBalloonWindowScale`)
  - パースされた `props.dpi` から `--balloon-dpi` および `--balloon-dpi-scale` カスタムプロパティを生成し、`.balloon` 要素へ `scale(finalScale)` を適用。
