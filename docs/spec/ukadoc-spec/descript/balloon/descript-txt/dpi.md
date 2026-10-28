# dpi,推奨DPI

- **規格**: [dpi.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/dpi/) (ukadoc-spec/descript/balloon/descript-txt/dpi.md)
- **検索語**: dpi
- **対応状況**: ✅ 対応済
- **規格**: [dpi.md](../../../../ukadoc-spec/descript/balloon/descript-txt/dpi.md) (`ukadoc-spec/descript/balloon/descript-txt/dpi.md`)
- **カテゴリ**: `descript.txt`（Balloon）
- **書式**: `dpi,推奨DPI`
- **既定値**: `96`（Windows標準 100% スケーリング相当）
- **SSP対応バージョン**: SSP 2.7.21 以降
- **検索語**: `dpi`, `balloonDpiScale`, `balloon-scale`
- **対応状況**: ✅ 対応済（`descript.txt` の `dpi` 指定値に基づく `96 / dpi` 論理ピクセル補正およびユーザー手動バルーン倍率との合成に対応）

## 突合結果

---

Tauri / Web レンダラ層において、高解像度ディスプレイ（DPI）に対応した Canvas スケーリングおよび CSS ピクセル比率調整が実装されている。

## 1. UKADOC 仕様概要

バルーン制作環境で想定している画面の推奨 DPI 値を指定するプロパティ。未指定時は Windows 標準の `96` 固定として扱われる。

| Windows ディスプレイ拡大縮小率 | 推奨 DPI 指定値 | 主な環境目安 |
| :--- | :--- | :--- |
| 100% | `96`（既定値） | フルHD（1920×1080）デスクトップ等 |
| 125% | `120` | モバイルノートPC |
| 150% | `144` | 4Kモニタ・高解像度ノートPC |
| 175% | `168` | 高精細タブレット・大型4K環境 |
| 200% | `192` | Retina / 超高精細ディスプレイ |

SSP（2.7.21以降）では、現在の OS ディスプレイ DPI（例: 144 = 150%）とバルーン側の推奨 `dpi` 指定値（例: 96 または 144）を比較し、高 DPI 環境でのバルーン自動スケーリング倍率（`OS_DPI / Balloon_DPI`）を決定するために用いられる。

---

## 2. `nanai-android-mascot` における設計・実装状況

### 2.1 WebView / CSS 論理ピクセルによる標準スケーリング

`nanai-android-mascot` は Tauri v2（WebView2 / Android System WebView）上で動作するため、OS のディスプレイ拡大縮小率（`window.devicePixelRatio`）は WebView エンジンによって自動的に処理される。

- **既定動作（`dpi,96` 相当）**:
  - CSS の `1px` は常に **96 DPI 基準の論理ピクセル（CSS Pixel）** として扱われる。
  - そのため、`dpi` 未指定（既定値 `96`）で制作された既存のすべてのバルーンは、Windows 125%（120 DPI）や 150%（144 DPI）、Android の高密度画面（`devicePixelRatio = 2.0〜3.0`）であっても、追加の計算なしで OS の拡大率に合わせて自動的に拡大表示される。

### 2.2 高 DPI 前提バルーン（`dpi,144` 等）における換算式

バルーン制作者が高 DPI 環境（例: `dpi,144` = 150%）で等倍表示される前提で高解像度画像（`balloons0.png` 等）や `validrect.*` / `font.height` を作成している場合、WebView がそのまま `96` DPI 基準として拡大すると、本来の意図より `144 / 96 = 1.5倍` 大きく表示される。

`descript.txt` の `dpi` 値を厳密に反映する場合の基準スケール換算式は以下の通りとなる：

$$\text{balloonDpiScale} = \frac{96}{\text{Number}(\text{props}[\text{"dpi"}]) || 96}$$

| `descript.txt` の記述 | CSS 論理ピクセルに対する補正倍率 (`96 / dpi`) | OS 150% (144 DPI) 環境での実画面表示倍率 (`1.5 × 補正倍率`) |
| :--- | :--- | :--- |
| 未指定 / `dpi,96` | `1.0`（等倍） | `1.5` 倍（OS拡大率に追従） |
| `dpi,120` | `0.8`（80%） | `1.2` 倍 |
| `dpi,144` | `0.6667`（66.7%） | `1.0` 倍（ドットバイドット等倍） |
| `dpi,192` | `0.5`（50%） | `0.75` 倍（OS 200% 環境で等倍） |

### 2.3 関連実装ファイルと突合結果

- **パーサ層**: [src-tauri/src/commands/shell.rs](../../../../src-tauri/src/commands/shell.rs) の `balloon_manifest` コマンドにて、`descript.txt` の全キー・値（`dpi` を含む）を `BTreeMap<String, String>` としてフロントエンドへ返却済み。
- **適用層（メインウィンドウ / 独立バルーンウィンドウ）**:
  - [ui/js/core/app-actions.js](../../../../ui/js/core/app-actions.js) の `applyBalloonDescript(props)`、`resetBalloonDescript()`、および `applyBalloonScaleAction(action)`
  - [ui/js/ghost/balloon-window.js](../../../../ui/js/ghost/balloon-window.js) の `applyBalloonDescript(theme)` および `updateBalloonWindowScale(balloonBox)`
  - `props.dpi` をパースし（未指定・不正値時は既定値 `96`）、`dpiScale = 96 / balloonDpi` を算出して CSS カスタムプロパティ（`--balloon-dpi`, `--balloon-dpi-scale`）へ設定。さらに右クリックメニューの「バルーン倍率（50%〜200%）」による手動スケール（`userScale`）と乗算した `finalScale = userScale * dpiScale` を `.balloon` 要素の `transform: scale(...)` に適用している。
