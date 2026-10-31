# SSP ウィンドウ・スナップ機能および位置リセット仕様 (Window Snap & Position Reset Specification)

- **規格**: [ukadoc-ssp/functions/window](https://ukatech.shillest.net/ukadoc-ssp/) / SSP デスクトップスナップ・ウインドウ配置規約
- **検索語**: resetPosition
- **対応状況**: ✅ 対応済

## 1. 概要

SSP および本アプリケーション（Nanai Android Mascot）における、キャラクター・バルーンウィンドウの画面端スナップ（ドッキング退避）および位置初期化（ポジションリセット）に関する動作仕様。

## 2. 位置リセットとシェル/バルーン初期化

- **シェル位置初期化 (`reset-shell-position`)**: 画面上の任意の位置に移動していたシェルの座標・倍率を既定位置へリセット。
- **バルーン位置初期化 (`reset-balloon-position` / `resetballoonpos`)**: バルーンのオフセット（初期 0,0）をリセット。

## 実装箇所

- `ui/windows/desktop-features.html:62` `<button type="button" class="btn btn-secondary" onclick="resetPosition()">`
- `ui/windows/desktop-features.js:75` `export function resetPosition() {`
- `ui/windows/desktop-features.js:193` `globalThis.resetPosition = resetPosition;`
